import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import ImpactSummaryCard from "../components/ImpactSummaryCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import BadgePill from "../components/BadgePill.jsx";

export default function OrgImpact() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [orgRes, eventsRes, reviewsRes] = await Promise.all([
          api.get(`/orgs/${id}`),
          api.get("/events"),
          api.get(`/org/${id}/reviews`),
        ]);
        setOrg(orgRes.data);
        setEvents((eventsRes.data || []).filter((event) => (event.organization?._id || event.organization) === id));
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load organization impact.");
      }
    };
    if (id) load();
  }, [id]);

  const summary = useMemo(() => {
    const volunteersServed = events.reduce((sum, event) => sum + (event.volunteers?.length || 0), 0);
    const volunteerHours = events.reduce(
      (sum, event) => sum + ((event.volunteers || []).filter((entry) => entry.approved).length * (event.hours || 0)),
      0
    );
    const supportedCauses = Array.from(new Set(events.flatMap((event) => event.tags || [])));
    return { volunteersServed, volunteerHours, supportedCauses };
  }, [events]);

  return (
    <PageShell
      links={[
        { to: `/org/${id}`, label: "Profile" },
        { to: "/events", label: "Events" },
        { to: "/impact", label: "Impact" },
      ]}
    >
      <Hero
        badge="Organization Impact"
        title={org?.organizationName || org?.name || "Organization impact"}
        subtitle="A public-facing summary of delivery, participation, and community trust."
        height="min-h-[320px]"
      />

      {message ? <ErrorState message={message} /> : null}

      {org ? (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ImpactSummaryCard label="Events hosted" value={events.length} helper="Published opportunities" />
            <ImpactSummaryCard label="Volunteers served" value={summary.volunteersServed} helper="Requests and participation" />
            <ImpactSummaryCard label="Impact hours" value={summary.volunteerHours} helper="Estimated approved hours" />
            <ImpactSummaryCard label="Reviews" value={reviews.length} helper="Community feedback received" />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="nepal-card p-8">
              <SectionHeader eyebrow="Supported Causes" title="Where this organization is creating value" />
              <div className="mt-6 flex flex-wrap gap-2">
                {summary.supportedCauses.length ? summary.supportedCauses.map((cause) => <BadgePill key={cause} tone="red">{cause}</BadgePill>) : <p className="text-sm text-muted">Causes will appear once events are published.</p>}
              </div>
              <div className="mt-8 space-y-4">
                {events.slice(0, 4).map((event) => (
                  <div key={event._id} className="rounded-[14px] bg-white/75 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold text-ink">{event.title}</h3>
                      <BadgePill tone="blue">{event.volunteers?.length || 0} volunteers</BadgePill>
                    </div>
                    <p className="mt-2 text-sm text-muted">{event.location || "Location TBD"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="nepal-card p-8">
              <SectionHeader eyebrow="Trust Signals" title="How volunteers describe the experience" />
              <div className="mt-6 space-y-4">
                {reviews.length ? reviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="rounded-[14px] bg-white/75 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ink">{review.volunteer}</p>
                      <BadgePill tone="amber">{review.rating} / 5</BadgePill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{review.comment || "No written comment provided."}</p>
                  </div>
                )) : <EmptyState compact title="No reviews yet" message="Reviews will appear after volunteers complete events with this organization." />}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
