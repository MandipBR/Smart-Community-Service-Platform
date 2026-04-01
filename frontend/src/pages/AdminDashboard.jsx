import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const [orgs, setOrgs] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("newest");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", status);
    params.set("page", page);
    params.set("limit", 8);
    params.set("sort", sort);
    if (query.trim()) params.set("q", query.trim());
    api
      .get(`/admin/orgs?${params.toString()}`)
      .then((res) => {
        setOrgs(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch((err) =>
        setMessage(err?.response?.data?.message || "Unable to load orgs.")
      );
  }, [status, query, page, sort]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          api.get("/admin/orgs?status=pending&limit=1"),
          api.get("/admin/orgs?status=approved&limit=1"),
          api.get("/admin/orgs?status=rejected&limit=1"),
        ]);
        setStats({
          pending: pendingRes.data.total || 0,
          approved: approvedRes.data.total || 0,
          rejected: rejectedRes.data.total || 0,
        });
      } catch {
        // ignore stats errors
      }
    };
    loadStats();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/orgs/${id}/approve`);
    setOrgs((prev) => prev.filter((o) => o._id !== id));
  };

  const reject = async (id) => {
    await api.put(`/admin/orgs/${id}/reject`);
    setOrgs((prev) => prev.filter((o) => o._id !== id));
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-soft">
              <span className="text-sm font-semibold text-brandRed">SC</span>
            </div>
            <span className="font-heading text-lg font-semibold">Admin approvals</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/admin/analytics" className="nepal-button-secondary">
              Analytics
            </Link>
            <Link to="/admin/users" className="nepal-button-secondary">
              Users
            </Link>
            <Link to="/admin/events" className="nepal-button-secondary">
              Events
            </Link>
            <Link to="/admin/logs" className="nepal-button-secondary">
              Logs
            </Link>
            <Link to="/dashboard" className="nepal-button-secondary">
              Dashboard
            </Link>
          </nav>
        </header>

        <section className="nepal-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Organization approvals</h2>
              <p className="mt-2 text-sm text-muted">
                Review and approve verified organizations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                className="nepal-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="nepal-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <input
                className="nepal-input"
                placeholder="Search by name or email"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: "Pending", value: stats.pending },
              { label: "Approved", value: stats.approved },
              { label: "Rejected", value: stats.rejected },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          {message ? <div className="mt-4 text-sm text-brandRed">{message}</div> : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {orgs.map((org) => (
              <div className="rounded-xl border border-white/70 bg-white/70 p-5" key={org._id}>
                <h4 className="font-semibold text-ink">{org.organizationName || org.name}</h4>
                <p className="text-xs text-muted">{org.email}</p>
                <p className="text-xs text-muted">{org.organizationType || "Org"}</p>
                <div className="mt-4 flex gap-3">
                  <button className="nepal-button" onClick={() => approve(org._id)}>
                    Approve
                  </button>
                  <button className="nepal-button-secondary" onClick={() => reject(org._id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {total > 0 ? (
            <div className="mt-6 flex items-center justify-between">
              <button
                className="nepal-button-secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-xs text-muted">
                Page {page} of {Math.max(1, Math.ceil(total / 8))}
              </span>
              <button
                className="nepal-button-secondary"
                onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(total / 8)))}
                disabled={page >= Math.ceil(total / 8)}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
