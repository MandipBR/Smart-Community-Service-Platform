import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getToken, getUser, setAuth } from "../services/api";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";

export default function OrgProfile() {
  const { t } = useTranslation();
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
        const res = await api.get("/users/me");
        setUser(res.data);
        setAuth(getToken(), res.data);
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
      setMessage(t('org.profile_updated'));
    } catch (err) {
      setMessage(err?.response?.data?.message || "Update failed.");
    }
  };

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('nav.org_profile')} 
        description={t('org.profile_update')} 
      />

      <div className="flex flex-col items-center justify-center py-12 animate-fadeUp">
        <div className="w-full max-w-[1200px] space-y-12">
          
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[720px]">
              <p className="eyebrow Onboarding mb-4">{t('org.management')}</p>
              <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl leading-[1.1]">
                {t('nav.org_profile')}
              </h1>
              <p className="mt-4 text-lg text-muted font-medium">
                {t('org.presence_manage')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-2xl border border-brandBlue/10 bg-brandBlue/5 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brandBlue">
                {user?.name || "Partner Identity"}
              </span>
              <div className={`h-11 px-6 rounded-2xl flex items-center justify-center text-[10px] font-bold uppercase tracking-widest ${
                user?.orgApprovalStatus === "approved"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}>
                {user?.orgApprovalStatus === "approved" ? t('nav.approvals') : t('dashboard.rank_progression')}
              </div>
            </div>
          </header>

          <form className="grid gap-10 lg:grid-cols-[1fr_420px]" onSubmit={submit}>
            
            {/* Left: Identity & Narrative */}
            <div className="nepal-card p-10 space-y-10 group">
               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-slate-50 blur-3xl" />
               
               <div className="relative z-10 space-y-8">
                  <div className="nepal-field">
                    <label className="nepal-label">{t('org.headline')}</label>
                    <input
                      className="nepal-input h-14"
                      placeholder={t('org.placeholder_org_name')}
                      value={form.organizationName}
                      onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="nepal-field">
                      <label className="nepal-label">{t('events.location')}</label>
                      <input
                        className="nepal-input h-14"
                        placeholder="Location"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                    </div>
                    <div className="nepal-field">
                      <label className="nepal-label">{t('onboarding.phone')}</label>
                      <input
                        className="nepal-input h-14 font-bold"
                        placeholder="+977"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="nepal-field">
                    <label className="nepal-label">{t('org.narrative')}</label>
                    <textarea
                      className="nepal-input min-h-[160px] pt-6 leading-relaxed"
                      placeholder={t('org.placeholder_bio')}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="nepal-field">
                      <label className="nepal-label">{t('org.tags')}</label>
                      <input
                        className="nepal-input h-14"
                        placeholder={t('org.placeholder_tags')}
                        value={form.causes}
                        onChange={(e) => setForm({ ...form, causes: e.target.value })}
                      />
                    </div>
                    <div className="nepal-field">
                      <label className="nepal-label">{t('events.skills')}</label>
                      <input
                        className="nepal-input h-14"
                        placeholder={t('org.placeholder_skills')}
                        value={form.skills}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Team Module */}
            <aside className="space-y-10">
              <section className="nepal-card p-10 bg-slate-50/50 border-slate-100">
                <h3 className="text-2xl font-bold text-ink mb-10 leading-tight">{t('org.team_members')}</h3>
                
                <div className="space-y-6">
                  {form.teamMembers.map((member, index) => (
                    <div className="p-6 rounded-2xl bg-white shadow-soft border border-slate-50 space-y-4" key={`member-${index}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <input
                            className="nepal-input h-11 text-sm bg-slate-50/50 border-0"
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => {
                              const next = [...form.teamMembers];
                              next[index] = { ...member, name: e.target.value };
                              setForm({ ...form, teamMembers: next });
                            }}
                          />
                          <input
                            className="nepal-input h-11 text-sm bg-slate-50/50 border-0"
                            placeholder="Email"
                            type="email"
                            value={member.email}
                            onChange={(e) => {
                              const next = [...form.teamMembers];
                              next[index] = { ...member, email: e.target.value };
                              setForm({ ...form, teamMembers: next });
                            }}
                          />
                        </div>
                        <button
                          className="h-11 w-11 flex items-center justify-center flex-shrink-0 text-muted/40 hover:text-brandRed transition-colors"
                          type="button"
                          onClick={() => {
                            const next = form.teamMembers.filter((_, idx) => idx !== index);
                            setForm({ ...form, teamMembers: next });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <select
                        className="w-full h-11 rounded-xl bg-slate-100 text-[11px] font-bold uppercase tracking-widest px-4 outline-none appearance-none border border-slate-200"
                        value={member.role || "viewer"}
                        onChange={(e) => {
                          const next = [...form.teamMembers];
                          next[index] = { ...member, role: e.target.value };
                          setForm({ ...form, teamMembers: next });
                        }}
                      >
                        <option value="admin">{t('common.admin')}</option>
                        <option value="editor">{t('common.editor')}</option>
                        <option value="viewer">{t('common.viewer')}</option>
                      </select>
                    </div>
                  ))}
                  
                  <button
                    className="w-full h-14 rounded-[22px] border-2 border-dashed border-slate-200 text-xs font-bold text-muted/60 uppercase tracking-widest hover:border-brandBlue hover:text-brandBlue transition-all"
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
                    + {t('org.add_member')}
                  </button>
                </div>
              </section>

              {message && (
                <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 px-8 py-5 text-[15px] font-bold text-emerald-700 animate-fadeUp shadow-sm">
                  {message}
                </div>
              )}

              <button className="nepal-button w-full h-14 shadow-lift tracking-tight" type="submit">
                {t('common.save')}
              </button>
            </aside>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
