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
import { useTranslation } from "react-i18next";

export default function AdminUsers() {
  const { t } = useTranslation();
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
        setUsers(Array.isArray(res?.data?.data) ? res.data.data : []);
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
        { to: "/admin", label: t('nav.approvals') },
        { to: "/admin/events", label: t('nav.events') },
        { to: "/admin/logs", label: t('nav.logs') },
      ]}
    >
      <Hero badge={t('admin.admin_users')} title={t('admin.clearer_view_title')} subtitle={t('admin.clearer_view_desc')} height="min-h-[320px]" />

      <section className="nepal-card p-8">
        <SectionHeader
          eyebrow={t('admin.user_management')}
          title={t('admin.users_across_roles')}
          actions={
            <>
              <select className="nepal-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="all">{t('admin.all_roles')}</option>
                <option value="volunteer">{t('nav.volunteer')}</option>
                <option value="organization">{t('nav.organization')}</option>
                <option value="admin">{t('nav.admin')}</option>
              </select>
              <input className="nepal-input min-w-[240px]" placeholder={t('admin.search_users')} value={query} onChange={(e) => setQuery(e.target.value)} />
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
                <BadgePill tone={user.isVerified ? "green" : "amber"}>{user.isVerified ? t('admin.verified') : t('admin.unverified')}</BadgePill>
                {user.role === "organization" ? <BadgePill tone={user.orgApprovalStatus === "approved" ? "green" : user.orgApprovalStatus === "rejected" ? "amber" : "blue"}>{user.orgApprovalStatus}</BadgePill> : null}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted">
                <div className="rounded-[14px] bg-white/75 p-3">
                  <p className="text-xs uppercase tracking-[0.18em]">{t('admin.points')}</p>
                  <p className="mt-2 text-base font-semibold text-ink">{user.points || 0}</p>
                </div>
                <div className="rounded-[14px] bg-white/75 p-3">
                  <p className="text-xs uppercase tracking-[0.18em]">{t('admin.level')}</p>
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
