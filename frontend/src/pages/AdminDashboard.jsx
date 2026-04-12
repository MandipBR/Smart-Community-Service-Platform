import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import StatCard from "../components/StatCard.jsx";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [orgs, setOrgs] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort] = useState("newest");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("status", status);
        params.set("page", page || 1);
        params.set("limit", 9); // Scaled for 3-column xl grid
        params.set("sort", sort);
        if (query.trim()) params.set("q", query.trim());

        const res = await api.get(`/admin/orgs?${params.toString()}`);
        setOrgs(Array.isArray(res?.data?.data) ? res.data.data : []);
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
      } catch {
        // suppress stats fetch errors in dashboard shell
      }
    };

    loadData();
    loadStats();
  }, [status, query, page, sort]);

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
    } catch {
      // suppress stats fetch errors in action refresh
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/orgs/${id}/approve`);
      setOrgs(prev => prev.filter(o => o._id !== id));
      loadStats();
    } catch {
      setMessage("Action failed.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/orgs/${id}/reject`);
      setOrgs(prev => prev.filter(o => o._id !== id));
      loadStats();
    } catch {
      setMessage("Action failed.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 9));

  return (
    <PageShell withSidebar maxWidth="max-w-[1600px]" noFooter>
      <PageMeta 
        title={t('admin.oversight_title')} 
        description={t('admin.oversight_subtitle')} 
      />
      
      <header className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div className="max-w-[720px]">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl leading-[1.1]">{t('admin.oversight_title')}</h1>
          <p className="mt-4 text-lg text-muted font-medium">{t('admin.oversight_subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/analytics" className="nepal-button text-sm h-12 px-8 shadow-lift">{t('admin.health_status')}</Link>
          <Link to="/admin/logs" className="nepal-button-secondary text-sm h-12 px-6 border-slate-200">{t('admin.audit_logs')}</Link>
        </div>
      </header>

      {/* Global Stat Dashboard */}
      <section className="grid gap-8 sm:grid-cols-3 mb-12">
        <StatCard label={t('admin.approvals_pending')} value={stats.pending} icon="⏳" helper={t('admin.requires_attention')} trend="+0" />
        <StatCard label={t('admin.total_partners')} value={stats.approved} icon="🤝" helper={t('admin.verified_orgs')} trend="+2" />
        <StatCard label={t('admin.review_queue')} value={total} icon="📋" helper={t('admin.filtered_results')} />
      </section>

      {message && (
        <div className="rounded-[28px] border border-red-100 bg-red-50 px-8 py-5 text-[15px] font-bold text-brandRed animate-fadeUp mb-12">
          ✕ {message}
        </div>
      )}

      {/* Control Surface & Management Grid */}
      <section className="nepal-card p-10 mb-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between pb-10 border-b border-slate-50">
          <div className="flex flex-1 flex-wrap gap-8">
            <div className="nepal-field min-w-[200px]">
              <label className="nepal-label">{t('admin.approval_status')}</label>
              <select className="nepal-input h-12 font-bold" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="pending">{t('admin.status_pending')}</option>
                <option value="approved">{t('admin.status_approved')}</option>
                <option value="rejected">{t('admin.status_rejected')}</option>
              </select>
            </div>
            
            <div className="nepal-field min-w-[320px] flex-1">
              <label className="nepal-label">{t('admin.identity_search')}</label>
              <input 
                className="nepal-input h-12" 
                placeholder={t('admin.search_placeholder')}
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pb-1">
             <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="nepal-button-secondary h-12 px-6 disabled:opacity-30 border-slate-200"
             >
               {t('common.previous')}
             </button>
             <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] px-4 whitespace-nowrap">
               {t('common.page_of', { current: page, total: totalPages })}
             </span>
             <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="nepal-button-secondary h-12 px-6 disabled:opacity-30 border-slate-200"
             >
               {t('common.next')}
             </button>
          </div>
        </div>

        {/* Data Grid Overflow */}
        <div className="mt-12">
          {loading ? (
             <div className="flex items-center justify-center py-40">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brandRed border-t-transparent" />
             </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {orgs.map(org => (
                <div key={org._id} className="group relative rounded-[28px] border border-slate-50 p-8 transition-all hover:bg-slate-50 shadow-soft">
                   <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-ink leading-tight group-hover:text-brandRed transition-colors">{org.organizationName || org.name}</h4>
                      <p className="mt-2 text-sm font-medium text-muted/60">{org.email}</p>
                      <div className="mt-6 flex items-center gap-3">
                        <span className="rounded-xl bg-slate-900 px-3 py-1.5 text-[9px] font-bold text-white uppercase tracking-[0.15em]">
                          {org.organizationType || 'Partner'}
                        </span>
                        <span className="text-[10px] font-bold text-muted/40 uppercase tracking-widest pl-2">
                          {t('admin.joined_date')} {new Date(org.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(org._id)}
                            className="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-emerald-100 bg-white text-emerald-600 shadow-sm transition-transform hover:scale-110"
                            title="Approve"
                          >
                            <span className="text-xl">✓</span>
                          </button>
                          <button 
                            onClick={() => handleReject(org._id)}
                            className="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-red-100 bg-white text-brandRed shadow-sm transition-transform hover:scale-110"
                            title="Reject"
                          >
                            <span className="text-xl">✕</span>
                          </button>
                        </>
                      )}
                      {status !== 'pending' && (
                        <span className={`text-[10px] font-bold py-2 px-4 rounded-xl uppercase tracking-widest text-center ${
                          status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-brandRed border border-red-100'
                        }`}>
                          {status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orgs.length === 0 && (
                <div className="col-span-full py-40 text-center animate-fadeUp">
                   <div className="mx-auto h-24 w-24 mb-8 rounded-full bg-slate-50 flex items-center justify-center text-4xl shadow-inner border border-slate-100">
                     🔍
                   </div>
                   <h3 className="text-xl font-bold text-ink mb-2">{t('admin.no_matching_partners')}</h3>
                   <p className="text-sm font-bold text-muted/40 uppercase tracking-[0.3em]">{t('admin.no_partners')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Strategic Admin Utilities */}
      <div className="grid gap-10 md:grid-cols-2">
        <Link to="/admin/users" className="nepal-card p-10 flex items-center justify-between group overflow-hidden">
           <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-50 blur-2xl transition-transform group-hover:scale-150" />
           <div className="relative z-10 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-soft flex items-center justify-center text-2xl transition-transform group-hover:scale-110 border border-slate-50">👥</div>
              <div>
                <h4 className="text-lg font-bold text-ink">{t('admin.user_directory')}</h4>
                <p className="mt-1 text-sm text-muted/80 font-medium">{t('admin.manage_perms')}</p>
              </div>
           </div>
           <span className="text-2xl text-muted/30 transition-transform group-hover:translate-x-2">→</span>
        </Link>
        <Link to="/admin/events" className="nepal-card p-10 flex items-center justify-between group overflow-hidden">
           <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-50 blur-2xl transition-transform group-hover:scale-150" />
           <div className="relative z-10 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-soft flex items-center justify-center text-2xl transition-transform group-hover:scale-110 border border-slate-100">🎭</div>
              <div>
                <h4 className="text-lg font-bold text-ink">{t('admin.global_events')}</h4>
                <p className="mt-1 text-sm text-muted/80 font-medium">{t('admin.moderate_comm')}</p>
              </div>
           </div>
           <span className="text-2xl text-muted/30 transition-transform group-hover:translate-x-2">→</span>
        </Link>
      </div>
    </PageShell>
  );
}
