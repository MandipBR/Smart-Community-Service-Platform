import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { getUser, hasToken } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import StatCard from "../components/StatCard.jsx";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents 
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for icon issue in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Internal component for map click handling
function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

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

    const loadData = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data || []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Sync failed.");
      } finally {
        setLoading(false);
      }
    };

    if (hasToken()) loadData();
    else setLoading(false);
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
        setAttendanceMessage(err?.response?.data?.message || "Attendance sync failed.");
      }
    };
    loadAttendance();
  }, [attendanceEventId]);

  const handleMarkAttendance = async (userId, status) => {
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
      setAttendanceMessage(err?.response?.data?.message || "Update failed.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!form.title || !form.date) {
      setMessage("Title and Date are mandatory.");
      return;
    }
    try {
      await api.post("/events", {
        ...form,
        hours: Number(form.hours),
        difficultyFactor: Number(form.difficultyFactor || 1),
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      });
      setMessage("Event published successfully.");
      setForm({
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
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Publication failed.");
    }
  };

  if (loading) {
    return (
      <PageShell withSidebar maxWidth="max-w-[1200px]">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell withSidebar maxWidth="max-w-[1200px]">
      <PageMeta 
        title="Partner Dashboard" 
        description="Publish community events, verify volunteer hours, and manage your organization's social impact." 
      />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Partner Workspace</h1>
          <p className="mt-1 text-sm text-muted">Manage your opportunities and verify community impact.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/org/profile" className="nepal-button text-xs h-10 px-6">Organization Profile</Link>
          <div className="rounded-full bg-brandBlue/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brandBlue border border-brandBlue/20">
            Authenticated Partner
          </div>
        </div>
      </header>

      {orgStatus && orgStatus !== "approved" && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4 text-sm font-bold text-amber-800 animate-fadeUp">
          ⚠️ Your organization is pending manual verification. Event publishing is restricted to internal draft mode.
        </div>
      )}

      {/* High-level stats */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Events" value={ownEvents.length} icon="📅" trend="+0" helper="Live & upcoming" />
        <StatCard label="Total Volunteers" value={ownEvents.reduce((acc, ev) => acc + (ev.volunteers?.length || 0), 0)} icon="👥" trend="+12" helper="Across all time" />
        <StatCard label="Impact Level" value="Level 2" icon="🏗️" helper="Organization Tier" />
        <StatCard label="Reputation" value="98%" icon="⭐️" helper="Volunteer Feedback" />
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-4 text-sm font-bold text-emerald-700 animate-fadeUp">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Event Studio */}
        <div className="space-y-10">
          <section className="nepal-card p-10">
            <h2 className="text-xl font-bold text-ink mb-6">Event Studio</h2>
            <form onSubmit={handleCreateEvent} className="grid gap-6">
              <div className="nepal-field">
                <label className="nepal-label">Event Headline</label>
                <input 
                  className="nepal-input" 
                  placeholder="e.g. Kathmandu Heritage Cleanup 2024"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="nepal-field">
                  <label className="nepal-label">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="nepal-input"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    required
                  />
                </div>
                <div className="nepal-field">
                  <label className="nepal-label">Location Name</label>
                  <input 
                    className="nepal-input" 
                    placeholder="e.g. Patan Durbar Square"
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Geo-Spatial Intelligence Picker */}
              <div className="nepal-field">
                <label className="nepal-label">Geospatial Mission Site (Click Map to Pins)</label>
                <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner z-0">
                  <MapContainer center={[27.7172, 85.3240]} zoom={13} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapPicker 
                      position={form.locationLat && form.locationLng ? { lat: form.locationLat, lng: form.locationLng } : null}
                      setPosition={(latlng) => setForm({ ...form, locationLat: latlng.lat, locationLng: latlng.lng })}
                    />
                  </MapContainer>
                </div>
                <div className="mt-4 grid gap-4 grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-muted uppercase">Latitude</p>
                    <p className="text-xs font-bold text-ink">{form.locationLat || "Click map..."}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-muted uppercase">Longitude</p>
                    <p className="text-xs font-bold text-ink">{form.locationLng || "Click map..."}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="nepal-field">
                  <label className="nepal-label">Budgeted Hours</label>
                  <input 
                    type="number" 
                    className="nepal-input" 
                    value={form.hours}
                    onChange={e => setForm({...form, hours: e.target.value})}
                    required
                  />
                </div>
                <div className="nepal-field">
                  <label className="nepal-label">Complexity Factor</label>
                  <select 
                    className="nepal-input"
                    value={form.difficultyFactor}
                    onChange={e => setForm({...form, difficultyFactor: e.target.value})}
                  >
                    <option value={1}>Standard Activity</option>
                    <option value={1.5}>Medium Complexity</option>
                    <option value={2}>Specialized / High Intensity</option>
                  </select>
                </div>
              </div>

              <div className="nepal-field">
                <label className="nepal-label">Strategic Narrative (Description)</label>
                <textarea 
                  className="nepal-input min-h-[140px] pt-4"
                  placeholder="Explain the mission and what volunteers will be doing..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="nepal-field">
                  <label className="nepal-label">Thematic Tags</label>
                  <input 
                    className="nepal-input" 
                    placeholder="Environment, Heritage, Youth"
                    value={form.tags}
                    onChange={e => setForm({...form, tags: e.target.value})}
                  />
                </div>
                <div className="nepal-field">
                  <label className="nepal-label">Skills Required</label>
                  <input 
                    className="nepal-input" 
                    placeholder="Photography, First Aid"
                    value={form.skills}
                    onChange={e => setForm({...form, skills: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="nepal-button mt-4 w-full h-12 text-base font-bold shadow-lift"
                disabled={orgStatus !== "approved"}
              >
                Publish Strategic Opportunity
              </button>
            </form>
          </section>

          {/* Attendance Management */}
          <section className="nepal-card p-10 bg-slate-50/50 border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-ink">Impact Verification</h3>
                <p className="mt-1 text-xs text-muted">Verify volunteer attendance to award points.</p>
              </div>
              <select 
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-ink outline-none"
                value={attendanceEventId}
                onChange={e => setAttendanceEventId(e.target.value)}
              >
                <option value="">Select event to verify...</option>
                {ownEvents.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>

            {attendanceMessage && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-brandRed">
                {attendanceMessage}
              </div>
            )}

            <div className="space-y-4">
              {attendanceList.length > 0 ? (
                attendanceList.map(vol => (
                  <div key={vol.userId} className="nepal-card p-5 flex items-center justify-between gap-4 border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-brandRed/5 flex items-center justify-center text-sm font-bold text-brandRed">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{vol.name}</p>
                        <p className="text-[10px] uppercase font-bold text-muted">{vol.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => handleMarkAttendance(vol.userId, 'present')}
                        className={`h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                          vol.status === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-muted hover:text-emerald-600 hover:border-emerald-200'
                        }`}
                       >
                         Present
                       </button>
                       <button 
                        onClick={() => handleMarkAttendance(vol.userId, 'absent')}
                        className={`h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                          vol.status === 'absent' ? 'bg-brandRed text-white shadow-sm' : 'bg-white border border-slate-200 text-muted hover:text-brandRed hover:border-red-200'
                        }`}
                       >
                         Absent
                       </button>
                    </div>
                  </div>
                ))
              ) : attendanceEventId ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted">No volunteer applications found for this event.</p>
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Select an event above to start verification</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Live Opportunities Feed (Right) */}
        <aside className="space-y-8">
          <section className="nepal-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-ink">Live Feed</h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-5">
              {ownEvents.map(event => {
                const required = recommendedVolunteers(event.hours || 1, event.difficultyFactor || 1);
                const current = event.volunteers?.length || 0;
                const status = coverageStatus(required, current);
                
                return (
                  <div key={event._id} className="group relative rounded-2xl border border-slate-100 p-5 transition-all hover:bg-slate-50">
                    <div className="flex justify-between gap-3">
                      <h4 className="text-sm font-bold text-ink line-clamp-1">{event.title}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        status === 'Full' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted">
                      📍 {event.location || 'Location TBD'}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                        <span>Staffing</span>
                        <span>{current} / {required}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${current >= required ? 'bg-emerald-500' : 'bg-brandRed'}`}
                          style={{ width: `${Math.min(100, (current / required) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {ownEvents.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-xs text-muted">No active initiatives found.</p>
                </div>
              )}
            </div>
          </section>

          <section className="nepal-card p-10 bg-gradient-to-br from-brandBlue to-brandRed border-0 text-white">
            <h3 className="text-lg font-bold">Deep Analytics</h3>
            <p className="mt-1 text-xs text-white/80 leading-relaxed">
              Measure the social return on your organization's community initiatives.
            </p>
            <Link to="/org/analytics" className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-all">
              Launch Analytics Hub
            </Link>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
