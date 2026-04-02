import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getUser } from "../services/api";
import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";

export default function OrgPublicProfile() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const isAdmin = useMemo(() => getUser()?.role === "admin", []);

  const canReview = useMemo(() => {
    const user = getUser();
    return user?.role === "volunteer";
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [orgRes, reviewRes] = await Promise.all([
          api.get(`/orgs/${id}`),
          api.get(`/org/${id}/reviews`),
        ]);
        const safeReviews = Array.isArray(reviewRes?.data?.reviews)
          ? reviewRes.data.reviews
          : [];
        setOrg(orgRes.data);
        setReviews(safeReviews);
        setReviewStats({
          averageRating: Number(reviewRes?.data?.averageRating) || 0,
          count: Number(reviewRes?.data?.count) || 0,
        });
      } catch (err) {
        setMessage(err?.response?.data?.message || "Organization not found.");
      }
    };
    if (id) load();
  }, [id]);

  const submitReview = async () => {
    try {
      await api.post("/reviews", {
        organizationId: id,
        rating: Number(rating),
        comment,
      });
      setComment("");
      const reviewRes = await api.get(`/org/${id}/reviews`);
      setReviews(Array.isArray(reviewRes?.data?.reviews) ? reviewRes.data.reviews : []);
      setReviewStats({
        averageRating: Number(reviewRes?.data?.averageRating) || 0,
        count: Number(reviewRes?.data?.count) || 0,
      });
      setMessage("Review submitted.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to submit review.");
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
            { to: `/org/${id}/impact`, label: "Org Impact" },
          ]}
        />

        <Hero
          badge="Community Partner"
          title={org?.organizationName || org?.name || "Organization"}
          subtitle="Learn about their mission, team, and volunteer reviews."
        />

        {message ? <div className="nepal-card p-4 text-sm text-brandRed">{message}</div> : null}

        {org ? (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="nepal-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="section-title">Profile</h2>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue">
                    Organization
                  </span>
                  {isAdmin ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        org.orgApprovalStatus === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {org.orgApprovalStatus === "approved" ? "Approved" : "Pending"}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{org.bio || "No bio yet."}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Location</p>
                  <p className="mt-2 text-sm text-ink">{org.location || "Not specified"}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Rating</p>
                  <p className="mt-2 text-sm text-ink">
                    {(Number(reviewStats?.averageRating) || 0).toFixed(1)} / 5 ({Number(reviewStats?.count) || 0})
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(org.causes || org.skills || ["Community"]).map((tag) => (
                  <span
                    className="rounded-full bg-brandRed/10 px-3 py-1 text-xs text-brandRed"
                    key={`${org.id}-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="nepal-card p-6">
              <h3 className="text-lg font-semibold text-ink">Team</h3>
              <div className="mt-4 space-y-3">
                {org.teamMembers && org.teamMembers.length ? (
                  org.teamMembers.map((member) => (
                    <div key={`${member.name}-${member.role}`} className="rounded-xl bg-white/70 p-4">
                      <p className="font-medium text-ink">{member.name}</p>
                      <p className="text-xs text-muted">{member.role}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No team members listed.</p>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="nepal-card p-6">
          <h3 className="text-lg font-semibold text-ink">Reviews</h3>
          <div className="mt-4 space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <div key={review.id} className="rounded-xl bg-white/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink">{review.volunteer}</p>
                    <span className="text-xs text-brandRed">{review.rating} stars</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{review.comment || "No comment"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No reviews yet.</p>
            )}
          </div>
        </section>

        {canReview ? (
          <section className="nepal-card p-6">
            <h3 className="text-lg font-semibold text-ink">Leave a review</h3>
            <div className="mt-4 grid gap-3">
              <select
                className="nepal-input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <textarea
                className="nepal-input min-h-[120px]"
                rows="4"
                placeholder="Share your experience"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="nepal-button" onClick={submitReview} type="button">
                Submit review
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
