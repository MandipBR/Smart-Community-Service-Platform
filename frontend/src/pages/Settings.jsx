import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { clearAuth, getToken, getUser, hasToken, setAuth } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cachedUser = getUser();
  
  const [tab, setTab] = useState("account");
  const [user, setUser] = useState(cachedUser);
  const [profile, setProfile] = useState({
    name: cachedUser?.name || "",
    email: cachedUser?.email || "",
    phone: cachedUser?.phone || "",
    bio: cachedUser?.bio || "",
    location: cachedUser?.location || "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasToken()) {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
        setAuth(getToken(), res.data);
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.profile?.phone || res.data.phone || "",
          bio: res.data.profile?.bio || res.data.bio || "",
          location: res.data.profile?.location || res.data.location || "",
        });
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const showMessage = (msg, type = "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleAvatarSuccess = (url) => {
    const updated = { ...user, avatar: url };
    setUser(updated);
    setAuth(getToken(), updated);
    showMessage(t('settings.avatar_success'), "success");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/profile", {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
      });
      showMessage(t('settings.profile_success'), "success");
    } catch (err) {
      showMessage(err?.response?.data?.message || t('settings.profile_error'));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showMessage(t('settings.pw_success'), "success");
    } catch (err) {
      showMessage(err?.response?.data?.message || t('settings.pw_error'));
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This action is permanent and cannot be undone.")) return;
    try {
      await api.delete("/users/me");
      clearAuth();
      navigate("/", { replace: true });
    } catch (err) {
      showMessage(err?.response?.data?.message || "Unable to delete account.");
    }
  };

  const TABS = [
    { id: "account", label: t('settings.tab_account'), icon: "👤" },
    { id: "security", label: t('settings.tab_security'), icon: "🔒" },
    { id: "notifications", label: t('settings.tab_notifications'), icon: "🔔" },
    { id: "privacy", label: t('settings.tab_privacy'), icon: "🛡️" },
  ];

  if (loading) {
    return (
      <PageShell maxWidth="max-w-[1600px]">
        <div className="flex items-center justify-center py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brandRed border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('settings.title')} 
        description={t('settings.subtitle')} 
      />

      {message && (
        <div
          className={`fixed right-10 top-24 z-50 rounded-[28px] px-8 py-5 text-sm font-bold shadow-2xl animate-fadeUp border ${
            messageType === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-brandRed border-red-100"
          }`}
          role="alert"
          aria-live="polite"
        >
          {messageType === 'success' ? '✓' : '✕'} {message}
        </div>
      )}

      <header className="mb-12 max-w-[800px] animate-fadeUp">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl leading-[1.1]">{t('settings.title')}</h1>
        <p className="mt-4 text-lg text-muted font-medium">{t('settings.subtitle')}</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[320px_1fr] animate-fadeUp">
        
        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-3" aria-label="Settings navigation">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-left text-sm font-bold transition-all shadow-soft ${
                tab === t.id
                  ? "bg-brandRed text-white shadow-xl scale-105"
                  : "bg-white text-muted hover:bg-slate-50 hover:text-ink border border-slate-50"
              }`}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <span className="text-xl" aria-hidden="true">{t.icon}</span>
              <span className="tracking-tight">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Dynamic Content Surface */}
        <div className="space-y-12">
          
          {/* Account Management Tab */}
          {tab === "account" && (
            <div className="space-y-12">
              <section className="nepal-card p-10 relative overflow-hidden group">
                 <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
                 <h2 className="relative z-10 text-2xl font-bold text-ink mb-2">{t('settings.profile_photo')}</h2>
                 <p className="relative z-10 text-md text-muted font-medium mb-10">Update your avatar so the community recognizes you.</p>
                 
                 <div className="relative z-10 flex justify-center md:justify-start">
                  <AvatarUpload
                    currentAvatar={user?.avatar}
                    onUploadSuccess={handleAvatarSuccess}
                  />
                </div>
              </section>

              <form onSubmit={saveProfile} className="nepal-card p-10 space-y-10 group">
                <div>
                  <h2 className="text-2xl font-bold text-ink mb-2">{t('settings.personal_info')}</h2>
                  <p className="text-md text-muted font-medium">Update your presence across the platform.</p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.full_name')}</label>
                    <input
                      className="nepal-input h-14"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.email_address')}</label>
                    <input
                      className="nepal-input h-14 bg-slate-50 cursor-not-allowed border-dashed opacity-60"
                      value={profile.email}
                      disabled
                    />
                    <p className="mt-3 text-[10px] uppercase tracking-widest font-bold text-muted/60">Email cannot be changed once verified.</p>
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.phone')}</label>
                    <input
                      className="nepal-input h-14 font-bold"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+977"
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.location')}</label>
                    <input
                      className="nepal-input h-14"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                  <div className="nepal-field sm:col-span-2">
                    <label className="nepal-label">{t('settings.bio')}</label>
                    <textarea
                      className="nepal-input min-h-[160px] pt-6 leading-relaxed"
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="nepal-button h-14 px-12 shadow-lift">
                    {t('settings.save_profile')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {tab === "security" && (
            <div className="space-y-12">
              <form onSubmit={changePassword} className="nepal-card p-10 space-y-10">
                <div>
                  <h2 className="text-2xl font-bold text-ink mb-2">{t('settings.change_pw')}</h2>
                  <p className="text-md text-muted font-medium">Ensure your account stays robustly secured.</p>
                </div>

                <div className="grid gap-8 max-w-[640px]">
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.current_pw')}</label>
                    <input
                      type="password"
                      className="nepal-input h-14"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.new_pw')}</label>
                    <input
                      type="password"
                      className="nepal-input h-14"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="nepal-field">
                    <label className="nepal-label">{t('settings.confirm_pw')}</label>
                    <input
                      type="password"
                      className="nepal-input h-14"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="nepal-button h-14 px-12 shadow-lift">
                    {t('settings.update_pw')}
                  </button>
                </div>
              </form>

              <div className="nepal-card border-brandRed/20 bg-brandRed/[0.02] p-10 relative overflow-hidden group">
                 <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform">
                    <div className="text-[140px] font-bold text-brandRed select-none italic">!</div>
                 </div>
                 <h2 className="relative z-10 text-2xl font-bold text-brandRed mb-4">{t('settings.danger_zone')}</h2>
                 <p className="relative z-10 text-lg text-muted font-medium max-w-[600px] mb-10">
                   Permanently delete your account and all associated verified impact data. This action is irreversible.
                 </p>
                 <button
                   type="button"
                   onClick={deleteAccount}
                   className="relative z-10 h-14 px-10 rounded-[28px] border-2 border-brandRed text-sm font-bold text-brandRed bg-white hover:bg-brandRed hover:text-white transition-all shadow-soft active:scale-95"
                 >
                   {t('settings.delete_account')}
                 </button>
              </div>
            </div>
          )}

          {/* Placeholder Tab UI */}
          {(tab === "notifications" || tab === "privacy") && (
            <div className="nepal-card p-24 text-center animate-fadeUp">
              <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50 text-4xl shadow-inner border border-slate-100">
                ⚙️
              </div>
              <h2 className="text-2xl font-bold text-ink tracking-tight">Configuration Engine Offline</h2>
              <p className="mt-4 text-lg text-muted max-w-[480px] mx-auto font-medium leading-relaxed">
                Fine-tuned granularity controls for your community lifecycle are currently being calibrated for the next system update.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
