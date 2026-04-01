import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { getUser, hasToken } from "../services/api";

const recommendedVolunteers = (hours, difficulty = 1) => {
  const averageCapacity = 2;
  return Math.max(1, Math.ceil((hours * difficulty) / averageCapacity));
};

const coverageStatus = (required, current) => {
  if (current >= required) return "Full";
  if (current >= required * 0.7) return "Almost Full";
  return "Needs Volunteers";
};

export default function OrgDashboard() {
  const currentUser = getUser();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    locationLat: "",
    locationLng: "",
    date: "",
    hours: 1,
    difficultyFactor: 1,
    tags: "",
    skills: "",
  });
  const [message, setMessage] = useState("");
  const [orgStatus] = useState(currentUser?.orgApprovalStatus);
  const [attendanceEventId, setAttendanceEventId] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const ownEvents = useMemo(() => {
    if (!currentUser?.id) return [];
    return events.filter((event) => {
      const ownerId =
        typeof event.organization === "string"
          ? event.organization
          : event.organization?._id;
      return ownerId === currentUser.id;
    });
  }, [events, currentUser?.id]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
      if (!hasToken()) {
        setMessage("Please sign in to manage organization events.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/events");
        setEvents(res.data || []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load events.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!attendanceEventId) {
        setAttendanceList([]);
        return;
      }
      try {
        const res = await api.get(`/attendance/event/${attendanceEventId}`);
        setAttendanceList(res.data.volunteers || []);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 403) {
          setAttendanceMessage("Only the hosting organization can manage attendance for this event.");
        } else {
          setAttendanceMessage(
            err?.response?.data?.message || "Unable to load attendance."
          );
        }
      }
    };
    loadAttendance();
  }, [attendanceEventId]);

  const markAttendance = async (userId, status) => {
    try {
      await api.post("/attendance/mark", {
        eventId: attendanceEventId,
        userId,
        status,
        verifiedByOrg: true,
      });
      setAttendanceList((prev) =>
        prev.map((item) =>
          item.userId === userId
            ? { ...item, status, verifiedByOrg: true }
            : item
        )
      );
      setAttendanceMessage("");
    } catch (err) {
      const statusCode = err?.response?.status;
      if (statusCode === 403) {
        setAttendanceMessage("Only the hosting organization can update attendance.");
      } else {
        setAttendanceMessage(
          err?.response?.data?.message || "Unable to update attendance."
        );
      }
    }
  };

  const create = async () => {
    setMessage("");
    if (!form.title || !form.date) {
      setMessage("Title and date are required to publish an event.");
      return;
    }
    try {
      await api.post("/events", {
        ...form,
        hours: Number(form.hours),
        difficultyFactor: Number(form.difficultyFactor || 1),
        locationLat: form.locationLat ? Number(form.locationLat) : undefined,
        locationLng: form.locationLng ? Number(form.locationLng) : undefined,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      setMessage("Event created successfully.");
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to create event.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="section-title">Organization dashboard</h2>
          <p className="mt-2 text-sm text-muted">
            Publish opportunities, track participation, and showcase impact.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="nepal-button-secondary" to="/org/profile">
            Organization profile
          </Link>
          <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs font-semibold text-brandBlue">
            Event Studio
          </span>
        </div>
      </div>

      {orgStatus && orgStatus !== "approved" ? (
        <div className="nepal-card p-4 text-sm text-brandRed">
          Your organization is pending admin approval. You can still edit your
          profile, but event publishing is disabled until approval.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="nepal-card p-6">
          <h3 className="text-lg font-semibold text-ink">Create event</h3>
          <div className="mt-4 grid gap-3">
            <input
              className="nepal-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="nepal-input"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="nepal-input"
                type="number"
                step="0.0001"
                placeholder="Latitude (optional)"
                value={form.locationLat}
                onChange={(e) =>
                  setForm({ ...form, locationLat: e.target.value })
                }
              />
              <input
                className="nepal-input"
                type="number"
                step="0.0001"
                placeholder="Longitude (optional)"
                value={form.locationLng}
                onChange={(e) =>
                  setForm({ ...form, locationLng: e.target.value })
                }
              />
            </div>
            <input
              className="nepal-input"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="nepal-input"
                type="number"
                min="1"
                placeholder="Hours"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
              <select
                className="nepal-input"
                value={form.difficultyFactor}
                onChange={(e) =>
                  setForm({ ...form, difficultyFactor: e.target.value })
                }
              >
                <option value={1}>Difficulty: Low</option>
                <option value={1.5}>Difficulty: Medium</option>
                <option value={2}>Difficulty: High</option>
              </select>
            </div>
            <textarea
              className="nepal-input min-h-[110px]"
              rows="3"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              className="nepal-input"
              placeholder="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <input
              className="nepal-input"
              placeholder="Skills needed (comma-separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            {message ? <div className="text-sm text-brandRed">{message}</div> : null}
            <button className="nepal-button" onClick={create} type="button">
              Publish event
            </button>
          </div>
        </div>

        <div className="nepal-card p-6">
          <h3 className="text-lg font-semibold text-ink">Active events</h3>
          <div className="mt-4 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`org-event-skeleton-${idx}`} className="rounded-xl bg-white/70 p-4">
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton mt-3 h-3 w-24 rounded" />
                  <div className="skeleton mt-3 h-3 w-full rounded" />
                </div>
              ))
            ) : ownEvents.length === 0 ? (
              <p className="text-sm text-muted">No events yet. Publish one to get started.</p>
            ) : null}

            {!loading &&
              ownEvents.map((event) => {
                const required = recommendedVolunteers(
                  event.hours || 1,
                  event.difficultyFactor || 1
                );
                const current = event.volunteers?.length || 0;
                const status = coverageStatus(required, current);
                return (
                  <div className="rounded-xl border border-white/70 bg-white/70 p-4" key={event._id}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-ink">{event.title}</h4>
                      <span className="text-xs font-semibold text-brandBlue">
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{event.location || "Location TBD"}</p>
                    <p className="text-xs text-muted">
                      {event.date ? new Date(event.date).toLocaleString() : "TBA"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Recommended volunteers: {required} | Current: {current}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(event.tags || event.skills || ["Community"]).map((tag) => (
                        <span
                          key={`${event._id}-${tag}`}
                          className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="nepal-card p-6">
        <h3 className="text-lg font-semibold text-ink">Attendance</h3>
        <p className="mt-2 text-sm text-muted">
          Mark volunteer attendance for completed events.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="nepal-input"
            value={attendanceEventId}
            onChange={(e) => {
              setAttendanceEventId(e.target.value);
              setAttendanceMessage("");
            }}
          >
            <option value="">Select an event</option>
            {ownEvents.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {attendanceMessage ? (
          <div className="mt-3 text-sm text-brandRed">{attendanceMessage}</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {attendanceEventId && attendanceList.length === 0 ? (
            <p className="text-sm text-muted">
              No volunteers found for this event yet.
            </p>
          ) : null}
          {attendanceList.map((vol) => (
            <div
              key={`${vol.userId}-${vol.email}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/70 p-4"
            >
              <div>
                <p className="font-medium text-ink">{vol.name}</p>
                <p className="text-xs text-muted">{vol.email}</p>
                <p className="text-xs text-muted">
                  Status:{" "}
                  <span className="text-ink">
                    {vol.status === "present" ? "Present" : "Absent"}
                  </span>
                  {vol.verifiedByOrg ? " • Verified" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="nepal-button-secondary"
                  type="button"
                  onClick={() => markAttendance(vol.userId, "present")}
                >
                  Mark present
                </button>
                <button
                  className="nepal-button-secondary"
                  type="button"
                  onClick={() => markAttendance(vol.userId, "absent")}
                >
                  Mark absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
