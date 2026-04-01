import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getUser, hasToken } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup 
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

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Event not found.");
      }
    };
    if (id) load();
  }, [id]);

  const handleJoin = async () => {
    try {
      await api.post(`/events/${id}/join`);
      alert("Application successfully submitted!");
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Join request failed.");
    }
  };

  const hasCoords = event?.locationLat && event?.locationLng;

  return (
    <PageShell>
      <PageMeta 
        title={event?.title || "Event Mission"}
        description="Detailed community service mission parameters, including location, requirements, and impact goals."
      />

      <div className="mx-auto w-full max-w-[1100px] py-6 sm:py-10">
        
        {message && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-brandRed animate-shake">
            {message}
          </div>
        )}

        {event ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Mission Criticals */}
            <div className="space-y-10">
              <header>
                <div className="inline-flex items-center gap-2 rounded-full bg-brandRed/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brandRed mb-6 border border-brandRed/10">
                  <span className="h-2 w-2 rounded-full bg-brandRed" />
                  Live Opportunity
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{event.title}</h1>
                <p className="mt-4 text-lg text-muted leading-relaxed max-w-2xl">
                  {event.description || "Detailed mission overview pending provider update."}
                </p>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="nepal-card p-6 border-slate-100 bg-slate-50/30">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Field Location</p>
                  <p className="mt-2 text-sm font-bold text-ink">{event.location || "TBD"}</p>
                </div>
                <div className="nepal-card p-6 border-slate-100 bg-slate-50/30">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Activation Date</p>
                  <p className="mt-2 text-sm font-bold text-ink">
                    {event.date ? new Date(event.date).toLocaleString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : "Scheduling..."}
                  </p>
                </div>
                <div className="nepal-card p-6 border-slate-100 bg-slate-50/30">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Mission Duration</p>
                  <p className="mt-2 text-sm font-bold text-ink">{event.hours} Hours</p>
                </div>
                <div className="nepal-card p-6 border-slate-100 bg-slate-50/30">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Strategic Partner</p>
                  <p className="mt-2 text-sm font-bold text-ink">
                    {event.organization?.organizationName || event.organization?.name || "Verified Partner"}
                  </p>
                </div>
              </div>

              {/* Geo-Spatial Awareness */}
              {hasCoords && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-ink">Geospatial Intelligence</h3>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${event.locationLat},${event.locationLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brandRed hover:underline flex items-center gap-2"
                    >
                      🚀 Get Navigational Data
                    </a>
                  </div>
                  <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm z-0">
                    <MapContainer center={[event.locationLat, event.locationLng]} zoom={15} className="h-full w-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[event.locationLat, event.locationLng]}>
                        <Popup>{event.title}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </section>
              )}

              <div>
                <h3 className="text-lg font-bold text-ink mb-4">Required Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {(event.tags || event.skills || ["Community Impact"]).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xl border border-brandRed/20 bg-brandRed/5 px-4 py-2 text-xs font-bold text-brandRed"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Control Hub */}
            <aside className="space-y-8">
              <div className="nepal-card p-8 sticky top-10 border-brandRed/20 bg-gradient-to-br from-white to-brandRed/5 shadow-lift">
                <h3 className="text-xl font-bold text-ink">Mission Deployment</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  Join this community activation to earn impact points and contribute to local sustainability goals.
                </p>
                
                <div className="mt-8 space-y-4">
                  {(() => {
                    const user = getUser();
                    const isVolunteer = user?.role === "volunteer";
                    const hasJoined = event.volunteers?.some(v => (v.user?._id || v.user) === user?.id);

                    if (!hasToken()) {
                      return (
                        <>
                          <Link className="nepal-button w-full h-12 text-base shadow-lift" to="/login">
                            Identify to Join
                          </Link>
                          <Link className="nepal-button-secondary w-full h-12 text-sm" to="/signup">
                            Create Identity
                          </Link>
                        </>
                      );
                    }
                    if (isVolunteer) {
                      return hasJoined ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Status: Registered</p>
                          <p className="mt-2 text-xs text-emerald-800/70">Your application has been logged. Stand by for coordinator instructions.</p>
                        </div>
                      ) : (
                        <button onClick={handleJoin} className="nepal-button w-full h-12 text-base shadow-lift">
                          Confirm Join Request
                        </button>
                      );
                    }
                    return (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Partner View</p>
                        <p className="mt-2 text-xs text-blue-800/70">You are viewing this as an organization. Volunteers use this portal to apply.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Impact Card */}
              <div className="nepal-card p-8 bg-ink text-white border-0 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Strategic Value</p>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{event.hours * 10}</p>
                    <p className="text-[10px] uppercase font-bold text-white/50">Point Yield</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
