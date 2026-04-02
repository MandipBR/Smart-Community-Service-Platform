import { useEffect, useState } from "react";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function Map() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/events");
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEvents([]);
      }
    };
    load();
  }, []);

  // Default center of Nepal
  const defaultCenter = [28.3949, 84.1240];

  // Fallback to generate deterministic coordinates near Nepal for events missing lat/lng
  const generateFallbackPos = (id) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    const offsetLat = ((sum % 100) - 50) / 50; 
    const offsetLng = (((sum * 3) % 100) - 50) / 40; 
    return [defaultCenter[0] + offsetLat, defaultCenter[1] + offsetLng];
  };

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t("map.title")} 
        description={t("map.subtitle")} 
      />
      
      <header className="mb-12 max-w-[800px]">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl leading-[1.1]">
          {t("map.title")}
        </h1>
        <p className="mt-4 text-lg text-muted/90 font-medium">
          {t("map.subtitle")}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* map container */}
        <div className="nepal-card relative h-[600px] overflow-hidden lg:h-[720px] group shadow-2xl border-white/40 z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={7} 
            scrollWheelZoom={true}
            className="h-full w-full outline-none"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map((event) => {
               const position = event.locationLat && event.locationLng 
                 ? [event.locationLat, event.locationLng] 
                 : generateFallbackPos(event._id || event.title);
                 
               if (!position) return null;
               
               return (
                 <Marker key={event._id} position={position}>
                   <Popup className="font-sans">
                     <div>
                       <h3 className="font-bold text-ink">{event.title}</h3>
                       <p className="text-sm text-muted mt-1">{event.location}</p>
                       <p className="text-xs text-brandRed font-semibold mt-2">{event.hours} {t("common.reward_pts")}</p>
                     </div>
                   </Popup>
                 </Marker>
               );
            })}
          </MapContainer>
        </div>

        {/* immersive sidebar */}
        <aside className="space-y-10">
          <section className="nepal-card p-10 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
            <h2 className="relative z-10 text-2xl font-bold text-ink leading-tight">{t('map.live_activity')}</h2>
            
            <div className="relative z-10 mt-10 space-y-10">
              {events.length > 0 ? (
                events.slice(0, 8).map((event) => (
                  <div key={event._id} className="group border-l-4 border-slate-100 pl-8 transition-all hover:border-brandRed">
                    <p className="text-[10px] font-bold text-muted/50 uppercase tracking-[0.2em] mb-2">{event.location}</p>
                    <h3 className="text-[17px] font-bold text-ink group-hover:text-brandRed transition-colors leading-[1.4]">
                      {event.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-3 text-[12px] font-bold text-muted/80">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-[9px] uppercase tracking-tighter">{t('common.pts', 'PTS')}</span>
                      {event.hours || 1} {t('common.reward_pts')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="text-4xl mb-6 opacity-20">🌍</div>
                  <p className="text-xs font-bold text-muted/40 uppercase tracking-[0.25em]">{t('map.no_events')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Map Layer Widget */}
          <section className="nepal-card p-10 bg-slate-900 text-white border-0 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 tracking-tight">{t('map.geospatial_intelligence')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {t('map.zoom_regions')}
            </p>
            <div className="mt-10 h-px bg-slate-800" />
            <p className="mt-6 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
              {t('map.last_synced')} {new Date().toLocaleTimeString()}
            </p>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
