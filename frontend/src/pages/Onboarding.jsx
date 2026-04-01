import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getUser, setAuth } from "../services/api";
import Hero from "../components/Hero.jsx";

export default function Onboarding() {
  const navigate = useNavigate();
  const storedUser = getUser();
  const [user, setUser] = useState(storedUser);
  const [form, setForm] = useState({
    phone: "",
    bio: "",
    location: "",
    organizationName: "",
    causes: "",
    skills: "",
    availability: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setAuth(localStorage.getItem("token"), res.data);
        setForm({
          phone: res.data.profile?.phone || "",
          bio: res.data.profile?.bio || "",
          location: res.data.profile?.location || "",
          organizationName: res.data.profile?.organizationName || "",
          causes: (res.data.profile?.causes || []).join(", "),
          skills: (res.data.profile?.skills || []).join(", "),
          availability: res.data.profile?.availability || "",
        });
        if (res.data.onboardingCompleted) {
          navigate("/dashboard");
        }
      } catch {
        navigate("/login");
      }
    };
    load();
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.post("/auth/onboarding", {
        ...form,
        causes: form.causes
          ? form.causes.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      setMessage("Profile completed. Redirecting...");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to save profile.");
    }
  };

  return (
    <div className="nepal-page">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-10 px-6 py-10">
        <Hero
          badge="Onboarding"
          title="Complete your profile"
          subtitle="Help us match you with the right opportunities and teams."
        />

        <section className="nepal-card p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold">
              {user?.role === "organization"
                ? "Organization onboarding"
                : "Volunteer onboarding"}
            </h2>
            <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue">
              Step 1 of 1
            </span>
          </div>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
            {user?.role === "organization" ? (
              <input
                className="nepal-input"
                placeholder="Organization name"
                value={form.organizationName}
                onChange={(e) =>
                  setForm({ ...form, organizationName: e.target.value })
                }
                required
              />
            ) : null}
            <input
              className="nepal-input"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="nepal-input"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <textarea
              className="nepal-input min-h-[120px]"
              rows="3"
              placeholder="Short bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <input
              className="nepal-input"
              placeholder="Causes (comma-separated)"
              value={form.causes}
              onChange={(e) => setForm({ ...form, causes: e.target.value })}
            />
            <input
              className="nepal-input"
              placeholder="Skills (comma-separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <input
              className="nepal-input"
              placeholder="Availability"
              value={form.availability}
              onChange={(e) =>
                setForm({ ...form, availability: e.target.value })
              }
            />
            {message ? <div className="text-sm text-brandRed">{message}</div> : null}
            <button className="nepal-button" type="submit">
              Save profile
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
