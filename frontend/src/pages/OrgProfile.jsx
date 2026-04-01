import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getUser, setAuth } from "../services/api";
import PageShell from "../components/PageShell.jsx";

export default function OrgProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [form, setForm] = useState({
    organizationName: "",
    phone: "",
    location: "",
    bio: "",
    causes: "",
    skills: "",
    teamMembers: [],
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setAuth(localStorage.getItem("token"), res.data);
        if (res.data.role !== "organization") {
          navigate("/dashboard");
          return;
        }
        setForm({
          organizationName: res.data.profile?.organizationName || "",
          phone: res.data.profile?.phone || "",
          location: res.data.profile?.location || "",
          bio: res.data.profile?.bio || "",
          causes: (res.data.profile?.causes || []).join(", "),
          skills: (res.data.profile?.skills || []).join(", "),
          teamMembers: res.data.profile?.teamMembers || [],
        });
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
      await api.put("/users/profile", {
        organizationName: form.organizationName,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
        causes: form.causes
          ? form.causes.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        teamMembers: form.teamMembers,
      });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to update profile.");
    }
  };

  return (
    <PageShell maxWidth="max-w-[960px]">

        <section className="nepal-card p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Organization profile</h2>
              <p className="mt-2 text-sm text-muted">
                Update your public profile and team roster.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brandBlue/10 px-3 py-1 text-xs text-brandBlue">
                {user?.name || "Organization"}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  user?.orgApprovalStatus === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {user?.orgApprovalStatus === "approved" ? "Approved" : "Pending"}
              </span>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <input
              className="nepal-input"
              placeholder="Organization name"
              value={form.organizationName}
              onChange={(e) =>
                setForm({ ...form, organizationName: e.target.value })
              }
              required
            />
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
              className="nepal-input min-h-[140px]"
              rows="4"
              placeholder="Organization bio"
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
              placeholder="Skills needed (comma-separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />

            <div className="rounded-2xl bg-white/70 p-4">
              <h3 className="text-lg font-semibold text-ink">Team members</h3>
              {form.teamMembers.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No team members added yet.</p>
              ) : null}
              <div className="mt-4 space-y-3">
                {form.teamMembers.map((member, index) => (
                  <div className="grid gap-3 md:grid-cols-4" key={`member-${index}`}>
                    <input
                      className="nepal-input"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const next = [...form.teamMembers];
                        next[index] = { ...member, name: e.target.value };
                        setForm({ ...form, teamMembers: next });
                      }}
                    />
                    <input
                      className="nepal-input"
                      placeholder="Email"
                      type="email"
                      value={member.email}
                      onChange={(e) => {
                        const next = [...form.teamMembers];
                        next[index] = { ...member, email: e.target.value };
                        setForm({ ...form, teamMembers: next });
                      }}
                    />
                    <select
                      className="nepal-input"
                      value={member.role || "viewer"}
                      onChange={(e) => {
                        const next = [...form.teamMembers];
                        next[index] = { ...member, role: e.target.value };
                        setForm({ ...form, teamMembers: next });
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      className="nepal-button-secondary"
                      type="button"
                      onClick={() => {
                        const next = form.teamMembers.filter(
                          (_, idx) => idx !== index
                        );
                        setForm({ ...form, teamMembers: next });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="nepal-button-secondary"
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      teamMembers: [
                        ...form.teamMembers,
                        { name: "", email: "", role: "viewer" },
                      ],
                    })
                  }
                >
                  Add team member
                </button>
              </div>
            </div>

            {message ? <div className="text-sm text-brandRed">{message}</div> : null}
            <button className="nepal-button" type="submit">
              Save profile
            </button>
          </form>
        </section>
    </PageShell>
  );
}


