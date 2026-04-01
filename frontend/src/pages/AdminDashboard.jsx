import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import StatCard from "../components/StatCard.jsx";

export default function AdminDashboard() {
  const [orgs, setOrgs] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("newest");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      params.set("page", page || 1);
      params.set("limit", 8);
      params.set("sort", sort);
      if (query.trim()) params.set("q", query.trim());

      const res = await api.get(`/admin/orgs?${params.toString()}`);
      setOrgs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [p, a, r] = await Promise.all([
        api.get("/admin/orgs?status=pending&limit=1"),
        api.get("/admin/orgs?status=approved&limit=1"),
        api.get("/admin/orgs?status=rejected&limit=1"),
      ]);
      setStats({
        pending: p.data.total || 0,
        approved: a.data.total || 0,
        rejected: r.data.total || 0,
      });
    } catch { /* suppress */ }
  };

  useEffect(() => {
    loadData();
    loadStats();
  }, [status, query, page, sort]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/orgs/${id}/approve`);
      setOrgs(prev => prev.filter(o => o._id !== id));
      loadStats();
    } catch (err) {
      setMessage("Action failed.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/orgs/${id}/reject`);
      setOrgs(prev => prev.filter(o => o._id !== id));
      loadStats();
    } catch (err) {
      setMessage("Action failed.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 8));

  return (
    <PageShell withSidebar maxWidth="max-w-[1200px]">
      <PageMeta 
        title="Admin Oversight" 
        description="Review community partnerships, verify organizations, and manage system integrity." 
      />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Admin Oversight</h1>
          <p className="mt-1 text-sm text-muted">Review community partnerships and system integrity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/analytics" className="nepal-button text-xs h-10 px-6">System Health</Link>
          <Link to="/admin/logs" className="nepal-button-secondary text-xs h-10 px-4">Audit Logs</Link>
        </div>
      </header>

      {/* Global Stat Row */}
      <section className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Pending Approval" value={stats.pending} icon="⏳" helper="Requires attention" trend="+0" />
        <StatCard label="Total Partners" value={stats.approved} icon="🤝" helper="Verified orgs" trend="+2" />
        <StatCard label="Review Queue" value={total} icon="📋" helper="Filtered results" />
      </section>

      {message && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-brandRed animate-fadeUp">
          {message}
        </div>
      )}

      {/* Control Surface */}
      <section className="nepal-card p-8 sm:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-wrap gap-6">
            <div className="nepal-field min-w-[160px]">
              <label className="nepal-label">Approval Status</label>
              <select className="nepal-input" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="nepal-field min-w-[240px] flex-1">
              <label className="nepal-label">Identity Search</label>
              <input 
                className="nepal-input" 
                placeholder="Name, email, or org type..."
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pb-1">
             <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="nepal-button-secondary h-11 px-4 disabled:opacity-50"
             >
               Previous
             </button>
             <span className="text-xs font-bold text-muted uppercase tracking-widest px-2">
               Page {page} of {totalPages}
             </span>
             <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="nepal-button-secondary h-11 px-4 disabled:opacity-50"
             >
               Next
             </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="mt-10">
          {loading ? (
             <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
             </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {orgs.map(org => (
                <div key={org._id} className="group relative rounded-2xl border border-slate-100 p-6 transition-all hover:bg-slate-50">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-[15px] font-bold text-ink">{org.organizationName || org.name}</h4>
                      <p className="mt-1 text-xs font-medium text-muted">{org.email}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-ink uppercase tracking-wider">
                          {org.organizationType || 'Partner'}
                        </span>
                        <span className="text-[10px] font-bold text-muted/60">•</span>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                          Joined {new Date(org.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(org._id)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition-transform hover:scale-105"
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => handleReject(org._id)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-brandRed shadow-sm transition-transform hover:scale-105"
                            title="Reject"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {status !== 'pending' && (
                        <span className={`text-[10px] font-bold py-1 px-3 rounded-full uppercase ${
                          status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-brandRed'
                        }`}>
                          {status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orgs.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center text-2xl opacity-50">
                     🔍
                   </div>
                   <p className="text-sm font-bold text-muted uppercase tracking-widest">No matching partners found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Advanced Links Footer */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/admin/users" className="nepal-card p-6 flex items-center justify-between group">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg transition-transform group-hover:scale-110">👥</div>
              <div>
                <h4 className="text-sm font-bold text-ink">User Directory</h4>
                <p className="text-xs text-muted">Manage volunteer permissions.</p>
              </div>
           </div>
           <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link to="/admin/events" className="nepal-card p-6 flex items-center justify-between group">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg transition-transform group-hover:scale-110">🎭</div>
              <div>
                <h4 className="text-sm font-bold text-ink">Global Events</h4>
                <p className="text-xs text-muted">Moderate community initiatives.</p>
              </div>
           </div>
           <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </PageShell>
  );
}
