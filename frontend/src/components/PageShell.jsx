import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

export default function PageShell({
  children,
  links,
  maxWidth = "max-w-[1600px]",
  contentClassName = "",
  unreadCount = 0,
  noFooter = false,
  noPadding = false,
  withSidebar = false, // new prop for dashboard layouts
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface transition-colors duration-500">
      <Navbar
        links={links}
        unreadCount={unreadCount}
        onMenuClick={withSidebar ? () => setSidebarOpen(true) : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        {withSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          id="main-content"
          className={`mx-auto flex w-full ${maxWidth} flex-1 flex-col gap-10 ${noPadding ? "" : "px-6 py-10 sm:py-12"} ${contentClassName} ${withSidebar ? "lg:ml-0" : ""}`}
        >
          {children}
        </main>
      </div>

      {!noFooter && <Footer />}
    </div>
  );
}
