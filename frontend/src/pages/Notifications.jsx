import { useEffect, useMemo, useRef, useState } from "react";
import api, { hasToken } from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

const formatType = (type) =>
  type
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");

const iconFor = (type) => {
  const map = {
    JOIN_APPROVED: "JA",
    EVENT_REMINDER: "ER",
    ORG_APPROVED: "OA",
    ORG_REJECTED: "OR",
    NEW_MATCH: "NM",
    CERTIFICATE_READY: "CR",
    EVENT_JOIN_APPROVED: "JA",
    NEW_EVENT_MATCH: "NM",
    HOURS_APPROVED: "CR",
  };
  return map[type] || "NT";
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const load = async () => {
    if (!hasToken()) {
      setMessage("Please sign in to view notifications.");
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/notifications");
      setItems(res.data.data || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setMessage("Please sign in to view notifications.");
      } else if (status === 403) {
        setMessage("You don't have access to notifications.");
      } else {
        setMessage(err?.response?.data?.message || "Unable to load notifications.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    load();
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items]
  );

  const grouped = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const key = new Date(item.createdAt).toLocaleDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [items]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to update.");
    }
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Navbar
          links={[
            { to: "/events", label: "Events" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/impact", label: "Impact" },
          ]}
        />

        <Hero
          badge="Notifications"
          title="Stay in the loop"
          subtitle="Event approvals, org updates, and new matches land here."
        />

        {message ? (
          <div className="nepal-card p-4 text-sm text-brandRed">{message}</div>
        ) : null}

        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-brandRed/10 px-3 py-1 text-brandRed">
            {unreadCount} unread
          </span>
        </div>

        <section className="nepal-card p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`notification-skeleton-${idx}`} className="rounded-xl bg-white/70 p-4">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                  <div className="skeleton mt-2 h-3 w-28 rounded" />
                </div>
              ))}
            </div>
          ) : items.length ? (
            <div className="space-y-6">
              {grouped.map(([date, group]) => (
                <div key={date} className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    {date}
                  </p>
                  {group.map((item) => (
                    <div
                      key={item._id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/70 p-4 transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:shadow-soft ${
                        item.isRead ? "" : "shadow-soft"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandRed/10 text-xs font-semibold text-brandRed">
                          {iconFor(item.type)}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted">
                            {formatType(item.type)}
                          </p>
                          <p className="mt-1 text-sm text-ink">{item.message}</p>
                          <p className="mt-1 text-xs text-muted">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {!item.isRead ? (
                        <button
                          className="nepal-button-secondary"
                          onClick={() => markRead(item._id)}
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="text-xs text-muted">Read</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No notifications yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
