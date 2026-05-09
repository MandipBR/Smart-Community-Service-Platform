import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

export default function AdminLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/admin/logs?page=${page}&limit=10`);
        setLogs(Array.isArray(res?.data?.data) ? res.data.data : []);
        setTotal(res.data.total || 0);
      } catch (err) {
        setMessage(err?.response?.data?.message || t("admin_logs.load_error", "Unable to load admin logs."));
      }
    };
    load();
  }, [page, t]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/admin", label: t("admin_logs.nav_approvals", "Approvals") },
            { to: "/admin/analytics", label: t("admin_logs.nav_analytics", "Analytics") },
            { to: "/dashboard", label: t("admin_logs.nav_dashboard", "Dashboard") },
          ]}
        />

        <Hero
          badge={t("admin_logs.badge", "Admin Logs")}
          title={t("admin_logs.title", "Audit activity")}
          subtitle={t("admin_logs.subtitle", "Track organization approvals, rejections, and moderation actions.")}
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        <section className="nepal-card p-6">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/70 p-4"
              >
                <div>
                  <p className="font-medium text-ink">{log.action}</p>
                  <p className="text-xs text-muted">
                    {log.admin?.name || t("admin_logs.admin_fallback", "Admin")} • {log.admin?.email || t("admin_logs.system_fallback", "system")}
                  </p>
                </div>
                <div className="text-xs text-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {logs.length === 0 ? (
              <p className="text-sm text-muted">{t("admin_logs.empty", "No admin logs yet.")}</p>
            ) : null}
          </div>

          {total > 0 ? (
            <div className="mt-6 flex items-center justify-between">
              <button
                className="nepal-button-secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t("common.previous", "Previous")}
              </button>
              <span className="text-xs text-muted">
                {t("common.page_of", "Page {{page}} of {{total}}", {
                  page,
                  total: Math.max(1, Math.ceil(total / 10)),
                })}
              </span>
              <button
                className="nepal-button-secondary"
                onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(total / 10)))}
                disabled={page >= Math.ceil(total / 10)}
              >
                {t("common.next", "Next")}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
