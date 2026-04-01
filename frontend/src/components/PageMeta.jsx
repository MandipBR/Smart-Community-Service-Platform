import { useEffect } from "react";

/**
 * Handle document title and meta description updates for SEO and accessibility (A11y).
 */
export default function PageMeta({ title, description }) {
  useEffect(() => {
    const baseTitle = "Smart Community Service Platform";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }
    
    // Announce route change for screen readers (optional but good)
    const announcement = document.getElementById('route-announcer');
    if (announcement) {
      announcement.textContent = `Navigated to ${title || "Home"}`;
    }
  }, [title, description]);

  return null;
}
