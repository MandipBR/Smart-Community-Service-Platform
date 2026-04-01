import { useState } from "react";
import PageShell from "../components/PageShell.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setStatus("Thanks — your message is ready to be sent to the support team.");
  };

  return (
    <PageShell
      links={[
        { to: "/about", label: "About" },
        { to: "/faq", label: "FAQ" },
        { to: "/events", label: "Events" },
      ]}
    >
      <Hero
        badge="Contact"
        title="Talk to the team behind Smart Community"
        subtitle="Use this space for partnership requests, platform support, or product feedback."
        height="min-h-[320px]"
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="nepal-card p-8">
          <SectionHeader
            eyebrow="Reach Out"
            title="We read practical feedback"
            subtitle="Tell us what is blocking your team, where volunteers need better support, or what would make the platform more useful."
          />
          <div className="mt-8 space-y-4 text-sm text-muted">
            <p>Email support for verification, onboarding, event publishing, and product feedback.</p>
            <p className="rounded-[14px] bg-white/75 p-4 text-ink">support@smartcommunity.local</p>
            <p className="rounded-[14px] bg-white/75 p-4 text-ink">Kathmandu, Nepal</p>
          </div>
        </div>

        <form className="nepal-card p-8" onSubmit={submit}>
          <SectionHeader eyebrow="Message" title="Send a note" subtitle="A clean, low-friction contact flow that fits the current product language." />
          <div className="mt-8 grid gap-4">
            <input className="nepal-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="nepal-input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <textarea className="nepal-input min-h-[180px] py-4" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            {status ? <p className="text-sm text-brandBlue">{status}</p> : null}
            <button className="nepal-button w-fit" type="submit">Send message</button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
