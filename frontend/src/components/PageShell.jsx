import Navbar from "./Navbar.jsx";

export default function PageShell({ children, links = [], contentClassName = "", maxWidth = "max-w-[1280px]" }) {
  return (
    <div className="nepal-page">
      <div className={`mx-auto flex min-h-screen w-full ${maxWidth} flex-col gap-12 px-6 py-10 ${contentClassName}`}>
        <Navbar links={links} />
        {children}
      </div>
    </div>
  );
}
