import { useEffect } from "react";
import api, { setAuth } from "../services/api";

export default function GoogleAuthButton({
  role = "volunteer",
  csrfToken,
  mountId,
  onError,
  onSuccess,
  width = 380,
}) {
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !csrfToken) return;

    let attempts = 0;
    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts < 20) setTimeout(tryInit, 150);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await api.post("/auth/google", {
              credential: response.credential,
              csrfToken,
              role,
            });
            setAuth(res.data.token, res.data.user);
            if (onSuccess) onSuccess(res.data);
          } catch (err) {
            if (onError) {
              onError(err?.response?.data?.message || "Google sign-in failed. Please try again.");
            }
          }
        },
      });

      const mountNode = document.getElementById(mountId);
      if (!mountNode) return;
      mountNode.innerHTML = "";
      window.google.accounts.id.renderButton(mountNode, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: Number(width) || 380,
      });
    };

    tryInit();
  }, [csrfToken, mountId, onError, onSuccess, role, width]);

  return <div id={mountId} className="flex justify-center" />;
}
