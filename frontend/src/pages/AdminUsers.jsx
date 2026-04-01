import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BadgePill from "../components/BadgePill.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("role", role);
    if (query.trim()) params.set("q", query.trim());

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/users?${params.toString()}`);
        setUsers(res.data.data || []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, role]);

  return (
    <PageShell
      links={[
        { to: "/admin", label: "Approvals" },
        { to: "/admin/events", label: "Events" },
        { to: "/admin/logs", label: "Logs" },
      ]}
    >
      <Hero badge="Admin Users" title="A clearer view of the people using the platform" subtitle="Filter by role, check verification state, and review the quality of your user base." height="min-h-[320px]" />

      <section className="nepal-card p-8">
        <SectionHeader
          eyebrow="User Management"
          title="Users across volunteers, organizations, and admins"
          actions={
            <>
              <select className="nepal-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="all">All roles</option>
                <option value="volunteer">Volunteers</option>
                <option value="organization">Organizations</option>
                <option value="admin">Admins</option>
              </select>
              <input className="nepal-input min-w-[240px]" placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
            </>
          }
        />
      </section>

      {loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><LoadingSkeleton className="h-[180px] w-full" count={6} /></div> : null}
      {message ? <ErrorState message={message} /> : null}
      {!loading && !message && !users.length ? <EmptyState title="No users found" message="Try a broader filter or search term." /> : null}

      {!loading && users.length ? (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user._id} className="nepal-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{user.name}</h3>
                  <p className="mt-1 text-sm text-muted">{user.email}</p>
                </div>
                <BadgePill tone="blue">{user.role}</BadgePill>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <BadgePill tone={user.isVerified ? "green" : "amber"}>{user.isVerified ? "verified" : "unverified"}</BadgePill>
                {user.role === "organization" ? <BadgePill tone={user.orgApprovalStatus === "approved" ? "green" : user.orgApprovalStatus === "rejected" ? "amber" : "blue"}>{user.orgApprovalStatus}</BadgePill> : null}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted">
                <div className="rounded-[14px] bg-white/75 p-3">
                  <p className="text-xs uppercase tracking-[0.18em]">Points</p>
                  <p className="mt-2 text-base font-semibold text-ink">{user.points || 0}</p>
                </div>
                <div className="rounded-[14px] bg-white/75 p-3">
                  <p className="text-xs uppercase tracking-[0.18em]">Level</p>
                  <p className="mt-2 text-base font-semibold text-ink">{user.level || 1}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </PageShell>
  );
}
