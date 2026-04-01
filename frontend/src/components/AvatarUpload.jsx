import { useRef, useState } from "react";
import api from "../services/api";

export default function AvatarUpload({ currentAvatar, onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Auto-upload on select for better UX
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onUploadSuccess) onUploadSuccess(res.data.avatar);
      setPreview(null); // clear preview since we have the real thing now
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const displayUrl = preview || (currentAvatar ? (currentAvatar.startsWith("http") ? currentAvatar : `${API_BASE}${currentAvatar}`) : null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md transition-all group-hover:shadow-lg sm:h-32 sm:w-32">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-300">
              ?
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-brandRed text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Upload photo"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {error && (
        <p className="text-xs font-semibold text-brandRed animate-pulse" role="alert">
          {error}
        </p>
      )}
      
      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
        {loading ? "Uploading..." : "JPG, PNG or WEBP (Max 2MB)"}
      </p>
    </div>
  );
}
