import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const { t } = useTranslation();
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
        setMessage(err?.response?.data?.message || t("admin.logs_load_error"));
      }
    };
    load();
  }, [page, t]);

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/admin", label: t("nav.approvals") },
            { to: "/admin/analytics", label: t("nav.analytics") },
            { to: "/dashboard", label: t("nav.dashboard") },
          ]}
        />

        <Hero
          badge={t("admin.admin_logs")}
          title={t("admin.audit_activity")}
          subtitle={t("admin.track_org_approvals")}
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
                    {log.admin?.name || t("admin.admin")} • {log.admin?.email || t("common.system")}
                  </p>
                </div>
                <div className="text-xs text-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {logs.length === 0 ? (
              <p className="text-sm text-muted">{t("admin.no_admin_logs")}</p>
            ) : null}
          </div>

          {total > 0 ? (
            <div className="mt-6 flex items-center justify-between">
              <button
                className="nepal-button-secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t("common.previous")}
              </button>
              <span className="text-xs text-muted">
                {t("common.page_of", { current: page, total: Math.max(1, Math.ceil(total / 10)) })}
              </span>
              <button
                className="nepal-button-secondary"
                onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(total / 10)))}
                disabled={page >= Math.ceil(total / 10)}
              >
                {t("common.next")}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
