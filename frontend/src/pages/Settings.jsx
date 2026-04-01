import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { clearAuth, getUser, getUserFromToken, hasToken, setAuth } from "../services/api";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";

export default function Settings() {
  const navigate = useNavigate();
  const tokenUser = getUserFromToken();
  const cachedUser = getUser();
  const userId = tokenUser?.id || cachedUser?.id;

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
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    eventReminders: true,
    matchAlerts: true,
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
        const res = await api.get("/auth/me");
        setUser(res.data);
        setAuth(localStorage.getItem("token"), res.data);
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
    setAuth(localStorage.getItem("token"), updated);
    showMessage("Avatar updated successfully.", "success");
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
      showMessage("Profile updated successfully.", "success");
    } catch (err) {
      showMessage(err?.response?.data?.message || "Unable to update profile.");
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
      showMessage("Password changed successfully.", "success");
    } catch (err) {
      showMessage(err?.response?.data?.message || "Unable to change password.");
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
    { id: "account", label: "Account", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🛡️" },
  ];

  if (loading) {
    return (
      <PageShell withSidebar maxWidth="max-w-[1000px]">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brandRed border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell withSidebar maxWidth="max-w-[1000px]">
      <PageMeta 
        title="Settings" 
        description="Personalize your Smart Community experience, update security preferences, and manage your public profile." 
      />
      {/* feedback message */}
      {message && (
        <div
          className={`fixed right-6 top-24 z-50 rounded-2xl px-6 py-4 text-sm font-bold shadow-lg animate-fadeUp border ${
            messageType === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-brandRed border-red-200"
          }`}
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* sidebar tabs */}
        <nav className="flex flex-col gap-2" aria-label="Settings navigation">
          <div className="mb-4 pl-4">
            <h1 className="text-xl font-bold text-ink">Settings</h1>
            <p className="text-xs text-muted">Personalize your experience</p>
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
                tab === t.id
                  ? "bg-brandRed text-white shadow-soft"
                  : "text-muted hover:bg-slate-100 hover:text-ink"
              }`}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* content */}
        <div className="space-y-8 animate-fadeUp">
          {/* Account tab */}
          {tab === "account" && (
            <div className="space-y-8">
              <section className="nepal-card p-8">
                <h2 className="text-lg font-bold text-ink">Public Profile Photo</h2>
                <p className="mt-1 text-sm text-muted">Update your avatar so the community recognizes you.</p>
                <div className="mt-8 flex justify-center md:justify-start">
                  <AvatarUpload
                    currentAvatar={user?.avatar}
                    onUploadSuccess={handleAvatarSuccess}
                  />
                </div>
              </section>

              <form onSubmit={saveProfile} className="nepal-card p-8">
                <h2 className="text-lg font-bold text-ink">Personal Information</h2>
                <p className="mt-1 text-sm text-muted">Update your presence across the platform.</p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div className="nepal-field">
                    <label htmlFor="settings-name" className="nepal-label">Full Name</label>
                    <input
                      id="settings-name"
                      className="nepal-input"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="nepal-field">
                    <label htmlFor="settings-email" className="nepal-label">Email Address</label>
                    <input
                      id="settings-email"
                      className="nepal-input bg-slate-50 cursor-not-allowed"
                      value={profile.email}
                      disabled
                      aria-describedby="email-help"
                    />
                    <p id="email-help" className="mt-2 text-[10px] uppercase tracking-widest font-bold text-muted">Email cannot be changed.</p>
                  </div>
                  <div className="nepal-field">
                    <label htmlFor="settings-phone" className="nepal-label">Phone Number</label>
                    <input
                      id="settings-phone"
                      className="nepal-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="e.g. +977 98..."
                    />
                  </div>
                  <div className="nepal-field">
                    <label htmlFor="settings-location" className="nepal-label">Primary Location</label>
                    <input
                      id="settings-location"
                      className="nepal-input"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g. Kathmandu, Nepal"
                    />
                  </div>
                  <div className="nepal-field sm:col-span-2">
                    <label htmlFor="settings-bio" className="nepal-label">Bio / Headline</label>
                    <textarea
                      id="settings-bio"
                      className="nepal-input min-h-[120px] pt-4"
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell the community how you want to contribute..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="submit" className="nepal-button">Save Profile</button>
                </div>
              </form>
            </div>
          )}

          {/* Security tab */}
          {tab === "security" && (
            <div className="space-y-8">
              <form onSubmit={changePassword} className="nepal-card p-8">
                <h2 className="text-lg font-bold text-ink">Change Password</h2>
                <p className="mt-1 text-sm text-muted">Ensure your account stays robustly secured.</p>

                <div className="mt-8 grid gap-6">
                  <div className="nepal-field">
                    <label htmlFor="current-pw" className="nepal-label">Current Password</label>
                    <input
                      id="current-pw"
                      type="password"
                      className="nepal-input"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="nepal-field">
                    <label htmlFor="new-pw" className="nepal-label">New Password</label>
                    <input
                      id="new-pw"
                      type="password"
                      className="nepal-input"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="nepal-field">
                    <label htmlFor="confirm-pw" className="nepal-label">Confirm New Password</label>
                    <input
                      id="confirm-pw"
                      type="password"
                      className="nepal-input"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="submit" className="nepal-button">Update Password</button>
                </div>
              </form>

              <div className="nepal-card border-slate-200 p-8">
                <h2 className="text-lg font-bold text-brandRed">Security Verification</h2>
                <p className="mt-1 text-sm text-muted">Login verification is currently enforced via OTP emails for higher account security.</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700 font-bold">✓</span>
                  <span className="text-sm font-bold text-ink">OTP Verification Active</span>
                </div>
              </div>

              <div className="nepal-card border-red-200 bg-red-50/20 p-8">
                <h2 className="text-lg font-bold text-brandRed">Danger Zone</h2>
                <p className="mt-1 text-sm text-muted">Permanently delete your account. This action cannot be reversed.</p>
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="mt-6 rounded-2xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-brandRed transition-all hover:bg-red-50 hover:shadow-sm active:scale-95"
                >
                  Delete Account Forever
                </button>
              </div>
            </div>
          )}

          {/* Notifications & Privacy (placeholder content but styled) */}
          {(tab === "notifications" || tab === "privacy") && (
            <div className="nepal-card p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-2xl">
                ⚙️
              </div>
              <h2 className="text-lg font-bold text-ink">Preference Logic Coming Soon</h2>
              <p className="mt-2 text-sm text-muted">Advanced granularity controls are being finalized for production release.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
