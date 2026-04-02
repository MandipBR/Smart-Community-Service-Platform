import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { getUser, hasToken } from "../services/api";
import { useTranslation } from "react-i18next";
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

export default function OrgDashboard() {
  const { t } = useTranslation();
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
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState([]);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("attendance"); // attendance, summary, history
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
        setEvents(Array.isArray(res.data) ? res.data : []);
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
        const volunteers = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.volunteers)
          ? res.data.volunteers
          : [];
        setAttendanceList(volunteers);
        setAttendanceMessage("");
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

  const toggleVolunteerSelection = (userId) => {
    setSelectedVolunteerIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllVolunteers = () => {
    const ids = attendanceList.map((item) => item.userId).filter(Boolean);
    setSelectedVolunteerIds(ids);
  };

  const clearAllSelection = () => {
    setSelectedVolunteerIds([]);
  };

  const handleBulkMark = async (status) => {
    if (!attendanceEventId || selectedVolunteerIds.length === 0) {
      setAttendanceMessage("No volunteers selected for bulk action.");
      return;
    }

    try {
      setIsBulkUpdating(true);
      const payload = {
        eventId: attendanceEventId,
        updates: selectedVolunteerIds.map((userId) => ({ userId, status })),
      };

      const res = await api.post("/attendance/bulk-mark", payload);
      const updatedVolunteers = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setAttendanceList((prev) => {
        const updatedMap = new Map(
          updatedVolunteers.map((vol) => [vol.userId, vol])
        );
        const newList = prev.map((item) =>
          updatedMap.has(item.userId)
            ? { ...item, ...updatedMap.get(item.userId) }
            : item
        );

        // Add any newly created attendances for volunteers not previously in list
        const newVolunteers = updatedVolunteers
          .filter((vol) => !newList.some((item) => item.userId === vol.userId));

        return [...newList, ...newVolunteers];
      });

      setAttendanceMessage(res?.data?.message || "Bulk update successful.");
      setSelectedVolunteerIds([]);
    } catch (err) {
      setAttendanceMessage(err?.response?.data?.message || "Bulk update failed.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleExportCSV = async () => {
    if (!attendanceEventId) {
      setAttendanceMessage("Select an event to export.");
      return;
    }
    try {
      const response = await api.get(`/attendance/event/${attendanceEventId}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${attendanceEventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setAttendanceMessage("Export failed.");
    }
  };

  const handleDownloadCertificate = async (userId) => {
    try {
      const response = await api.get(`/attendance/certificate/${attendanceEventId}/${userId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${userId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setAttendanceMessage("Certificate download failed.");
    }
  };

  const handleBulkCertificates = async () => {
    if (!attendanceEventId) {
      setAttendanceMessage("Select an event for certificates.");
      return;
    }
    try {
      const res = await api.get(`/attendance/certificates/${attendanceEventId}`);
      // For simplicity, download each; in production, handle zip
      res.data.data.forEach((cert) => {
        window.open(cert.downloadUrl, '_blank');
      });
    } catch {
      setAttendanceMessage("Bulk certificates failed.");
    }
  };

  const loadSummary = async () => {
    try {
      const res = await api.get("/attendance/summary");
      setSummaryData(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      console.error("Summary load failed");
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const res = await api.get("/attendance/notifications/history");
      setNotificationHistory(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      console.error("History load failed");
    }
  };

  useEffect(() => {
    if (activeTab === "summary") loadSummary();
    if (activeTab === "history") loadNotificationHistory();
  }, [activeTab]);

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
      setMessage("Successfully published.");
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
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Publication failed.");
    }
  };

  if (loading) {
    return (
      <PageShell withSidebar maxWidth="max-w-[1600px]">
        <div className="flex items-center justify-center py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brandBlue border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell withSidebar maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('org.workspace_title')} 
        description={t('org.workspace_subtitle')} 
      />
      
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div className="max-w-[720px]">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl leading-[1.1]">{t('org.dashboard_greeting_hi', { name: currentUser?.name || 'Partner' })}</h1>
          <p className="mt-4 text-lg text-muted font-medium">{t('org.dashboard_greeting_sub')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/org/profile" className="nepal-button text-sm h-12 px-8 shadow-lift">{t('org.quick_org_profile')}</Link>
          <div className="rounded-2xl bg-brandBlue/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brandBlue border border-brandBlue/20">
            {currentUser?.orgApprovalStatus === 'approved' ? t('admin.status_approved') : t('admin.status_pending')}
          </div>
        </div>
      </header>

      {orgStatus && orgStatus !== "approved" && (
        <div className="rounded-[28px] border border-amber-100 bg-amber-50 px-8 py-6 text-[15px] font-bold text-amber-900 animate-fadeUp mb-12 flex items-center gap-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-lg">⚠️</span>
          <p className="leading-relaxed">
            {t('org.pending_verification_warning')}
          </p>
        </div>
      )}

      {/* High-level analytics grid */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <StatCard label={t('nav.events')} value={ownEvents.length} icon="📅" trend="+0" helper={t('org.events_hosted')} />
        <StatCard label={t('org.volunteers_served')} value={ownEvents.reduce((acc, ev) => acc + (ev.volunteers?.length || 0), 0)} icon="👥" trend="+12" helper={t('dashboard.missions_desc')} />
        <StatCard label={t('dashboard.impact_level')} value="Level 2" icon="🏗️" helper={t('org.impact_summary')} />
        <StatCard label={t('org.trust_signals')} value="98%" icon="⭐️" helper={t('org.trust_signals')} />
      </section>

      {message && (
        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/50 px-8 py-5 text-[15px] font-bold text-emerald-700 animate-fadeUp mb-12 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
        
        {/* Left Column: Studio & Verification */}
        <div className="space-y-12">
          
          {/* Mission Studio Complex Form */}
          <section className="nepal-card p-10 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandBlue/5 blur-3xl transition-transform group-hover:scale-125" />
            
            <div className="relative z-10">
              <div className="mb-10">
                <p className="eyebrow Onboarding mb-4">{t('org.creation')}</p>
                <h2 className="text-2xl font-bold text-ink">{t('org.event_studio')}</h2>
              </div>
              
              <form onSubmit={handleCreateEvent} className="grid gap-8">
                <div className="nepal-field">
                  <label className="nepal-label">{t('org.headline')}</label>
                  <input 
                    className="nepal-input h-14" 
                    placeholder={t('org.placeholder_title')}
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    required
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="nepal-field">
                    <label className="nepal-label">{t('events.date_range')}</label>
                    <input 
                      type="datetime-local" 
                      className="nepal-input h-14 font-bold"
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('events.location')}</label>
                    <input 
                      className="nepal-input h-14" 
                      placeholder={t('org.placeholder_location')}
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Geo-Spatial Pinning Layer */}
                <div className="nepal-field">
                  <label className="nepal-label">{t('nav.map')} ({t('map.live_activity')})</label>
                  <div className="h-72 w-full rounded-[28px] overflow-hidden border border-slate-100 shadow-inner z-0 group/map">
                    <MapContainer center={[27.7172, 85.3240]} zoom={13} className="h-full w-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapPicker 
                        position={form.locationLat && form.locationLng ? { lat: form.locationLat, lng: form.locationLng } : null}
                        setPosition={(latlng) => setForm({ ...form, locationLat: latlng.lat, locationLng: latlng.lng })}
                      />
                    </MapContainer>
                    <div className="absolute top-4 left-4 z-[1000] rounded-xl bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-bold text-ink uppercase tracking-widest border border-slate-100">
                      {t('org.pin_active')}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{t('org.lat')}</p>
                      <p className="text-sm font-bold text-ink">{form.locationLat ? Number(form.locationLat).toFixed(4) : "..."}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{t('org.lng')}</p>
                      <p className="text-sm font-bold text-ink">{form.locationLng ? Number(form.locationLng).toFixed(4) : "..."}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="nepal-field">
                    <label className="nepal-label">{t('org.budgeted_hours')}</label>
                    <input 
                      type="number" 
                      className="nepal-input h-14 font-bold" 
                      value={form.hours}
                      onChange={e => setForm({...form, hours: e.target.value})}
                      required
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('org.complexity')}</label>
                    <select 
                      className="nepal-input h-14 font-bold"
                      value={form.difficultyFactor}
                      onChange={e => setForm({...form, difficultyFactor: e.target.value})}
                    >
                      <option value={1}>{t('org.standard_act')}</option>
                      <option value={1.5}>{t('org.med_complexity')}</option>
                      <option value={2}>{t('org.high_intensity')}</option>
                    </select>
                  </div>
                </div>

                <div className="nepal-field">
                  <label className="nepal-label">{t('org.narrative')}</label>
                  <textarea 
                    className="nepal-input min-h-[160px] pt-6 leading-relaxed"
                    placeholder={t('org.placeholder_narrative')}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="nepal-field">
                    <label className="nepal-label">{t('org.tags')}</label>
                    <input 
                      className="nepal-input h-14" 
                      placeholder={t('org.placeholder_tags')}
                      value={form.tags}
                      onChange={e => setForm({...form, tags: e.target.value})}
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('events.skills')}</label>
                    <input 
                      className="nepal-input h-14" 
                      placeholder={t('org.placeholder_skills')}
                      value={form.skills}
                      onChange={e => setForm({...form, skills: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="nepal-button mt-6 w-full h-14 text-base font-bold shadow-lift tracking-tight"
                  disabled={orgStatus !== "approved"}
                >
                  {t('org.publish_event')}
                </button>
              </form>
            </div>
          </section>

          {/* Impact Verification Queue */}
          <section className="nepal-card p-10 bg-slate-50/50 border-slate-200">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold text-ink">{t('org.verification')}</h3>
                <p className="mt-2 text-md text-muted font-medium">Verify service and award community points.</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="nepal-button bg-green-600 text-white h-10"
                  onClick={() => setActiveTab("attendance")}
                >
                  {t('org.attendance_tab')}
                </button>
                <button
                  className="nepal-button bg-blue-600 text-white h-10"
                  onClick={() => setActiveTab("summary")}
                >
                  {t('org.summary_tab')}
                </button>
                <button
                  className="nepal-button bg-purple-600 text-white h-10"
                  onClick={() => setActiveTab("history")}
                >
                  {t('org.history_tab')}
                </button>
              </div>
            </div>

            {activeTab === "attendance" && (
              <>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
                  <select 
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-ink outline-none"
                    value={attendanceEventId}
                    onChange={e => setAttendanceEventId(e.target.value)}
                  >
                    <option value="">{t('org.select_verify')}</option>
                    {ownEvents.map(ev => (
                      <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      className="nepal-button bg-orange-600 text-white h-10"
                      onClick={handleExportCSV}
                      disabled={!attendanceEventId}
                    >
                      {t('org.export_csv')}
                    </button>
                    <button
                      className="nepal-button bg-red-600 text-white h-10"
                      onClick={handleBulkCertificates}
                      disabled={!attendanceEventId}
                    >
                      {t('org.bulk_certificates')}
                    </button>
                  </div>
                </div>

                {attendanceMessage && (
                  <div className="mb-8 rounded-2xl bg-red-50 p-5 text-sm font-bold text-brandRed flex items-center gap-3">
                    <span className="text-lg">✕</span>
                    {attendanceMessage}
                  </div>
                )}

                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <button
                    className="nepal-button bg-blue-600 text-white h-10"
                    onClick={selectAllVolunteers}
                    disabled={attendanceList.length === 0}
                  >
                    {t('org.select_all')}
                  </button>
                  <button
                    className="nepal-button bg-purple-600 text-white h-10"
                    onClick={clearAllSelection}
                    disabled={selectedVolunteerIds.length === 0}
                  >
                    {t('org.clear_selection')}
                  </button>
                  <button
                    className="nepal-button bg-emerald-600 text-white h-10"
                    onClick={() => handleBulkMark('present')}
                    disabled={selectedVolunteerIds.length === 0 || isBulkUpdating}
                  >
                    {t('org.mark_present')}
                  </button>
                  <button
                    className="nepal-button bg-brandRed text-white h-10"
                    onClick={() => handleBulkMark('absent')}
                    disabled={selectedVolunteerIds.length === 0 || isBulkUpdating}
                  >
                    {t('org.mark_absent')}
                  </button>
                  <span className="text-sm text-muted">{selectedVolunteerIds.length} {t('org.selected')}</span>
                </div>

                <div className="grid gap-6">
                  {attendanceList.length > 0 ? (
                    attendanceList.map(vol => (
                      <div key={vol.userId} className="nepal-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-lg transition-all border-slate-100">
                        <div className="mr-3 flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedVolunteerIds.includes(vol.userId)}
                            onChange={() => toggleVolunteerSelection(vol.userId)}
                          />
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-brandRed/5 flex items-center justify-center text-xl font-bold text-brandRed border border-brandRed/10">
                            {(vol.name && vol.name.length > 0 ? vol.name.charAt(0) : "V")}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-ink">{vol.name || t('org.default_volunteer_name') || "Volunteer"}</p>
                            <p className="text-[11px] uppercase tracking-widest font-bold text-muted/60 mt-1">{vol.email || ""}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <button
                            className="nepal-button bg-yellow-600 text-white h-8 text-xs"
                            onClick={() => handleDownloadCertificate(vol.userId)}
                          >
                            {t('org.download_cert')}
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(vol.userId, 'present')}
                            className={`flex-1 sm:w-32 h-11 rounded-2xl text-[11px] font-bold uppercase tracking-[0.14em] transition-all shadow-sm ${
                              vol.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-muted hover:border-emerald-200 hover:text-emerald-600'
                            }`}
                          >
                            {t('common.present')}
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(vol.userId, 'absent')}
                            className={`flex-1 sm:w-32 h-11 rounded-2xl text-[11px] font-bold uppercase tracking-[0.14em] transition-all shadow-sm ${
                              vol.status === 'absent' ? 'bg-brandRed text-white' : 'bg-white border border-slate-200 text-muted hover:border-red-200 hover:text-brandRed'
                            }`}
                          >
                            {t('common.absent')}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : attendanceEventId ? (
                    <div className="py-20 text-center bg-white rounded-[28px] border border-slate-100">
                      <div className="text-5xl mb-6 opacity-10">👥</div>
                      <p className="text-md text-muted font-bold uppercase tracking-widest">{t('org.no_apps')}</p>
                    </div>
                  ) : (
                    <div className="py-24 border-4 border-dashed border-slate-100 rounded-[28px] text-center">
                       <div className="text-4xl mb-6 opacity-20">📋</div>
                       <p className="text-xs font-bold text-muted/40 uppercase tracking-[0.3em]">{t('org.select_active_initiative')}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "summary" && (
              <div className="grid gap-6">
                <h4 className="text-xl font-bold">{t('org.participation_summary')}</h4>
                {summaryData.length > 0 ? (
                  summaryData.map((item) => (
                    <div key={item.userId} className="nepal-card p-6">
                      <p className="font-bold">{item.name} ({item.email})</p>
                      <p>Total Hours: {item.totalHours}</p>
                      <p>Events Attended: {item.eventsAttended}</p>
                      <p>Present: {item.presentCount}, Absent: {item.absentCount}</p>
                    </div>
                  ))
                ) : (
                  <p>No summary data available.</p>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="grid gap-6">
                <h4 className="text-xl font-bold">{t('org.notification_history')}</h4>
                {notificationHistory.length > 0 ? (
                  notificationHistory.map((notif) => (
                    <div key={notif.id} className="nepal-card p-6">
                      <p className="font-bold">{notif.volunteerName} ({notif.volunteerEmail})</p>
                      <p>Type: {notif.type}</p>
                      <p>Message: {notif.message}</p>
                      <p>Timestamp: {new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No notification history available.</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Fleet Monitor & Intelligence */}
        <aside className="space-y-10">
          
          {/* Live Partner Feed */}
          <section className="nepal-card p-10 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brandBlue to-brandRed" />
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-ink">{t('org.live_feed')}</h3>
              <div className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
            </div>

            <div className="space-y-6">
              {ownEvents.map(event => {
                const required = recommendedVolunteers(event.hours || 1, event.difficultyFactor || 1);
                const current = event.volunteers?.length || 0;
                
                return (
                  <div key={event._id} className="group relative rounded-[22px] border border-slate-50 p-6 transition-all hover:bg-slate-50 shadow-soft">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h4 className="text-[15px] font-bold text-ink leading-tight line-clamp-2">{event.title}</h4>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                        current >= required ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {current >= required ? t('org.optimal') : t('org.staffing_needed')}
                      </span>
                    </div>
                    
                    {/* Capacity Visualization */}
                    <div className="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest mb-3 px-1">
                      <span>{t('org.staffing')}</span>
                      <span>{current} / {required} {t('org.engagee')}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-[1.5s] ease-out shadow-sm ${current >= required ? 'bg-emerald-500 shadow-emerald-200' : 'bg-brandRed shadow-brandRed/20'}`}
                        style={{ width: `${Math.min(100, (current / required) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {ownEvents.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-4 opacity-10">🌍</div>
                  <p className="text-xs font-bold text-muted/50 uppercase tracking-widest">{t('org.no_events')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Strategic Analytics Hook */}
          <section className="nepal-card p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-hero-glow opacity-10 transition-opacity group-hover:opacity-20" />
            <h3 className="text-xl font-bold leading-tight">{t('dashboard.impact_analytics')}</h3>
            <p className="mt-4 text-[15px] text-slate-400 leading-relaxed font-medium">
              {t('org.impact_summary')}
            </p>
            <div className="mt-10 pt-10 border-t border-white/10">
              <Link 
                to="/org/analytics" 
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all duration-500"
              >
                {t('org.launch_intelligence')}
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
