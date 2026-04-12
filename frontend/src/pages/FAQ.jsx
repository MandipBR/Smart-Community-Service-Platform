import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import Hero from "../components/Hero.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = [
    { q: 'faq.q_1', a: 'faq.a_1' },
    { q: 'faq.q_2', a: 'faq.a_2' },
    { q: 'faq.q_3', a: 'faq.a_3' },
    { q: 'faq.q_4', a: 'faq.a_4' },
    { q: 'faq.q_5', a: 'faq.a_5' },
  ];

  return (
    <PageShell maxWidth="max-w-[1600px]">
      <PageMeta 
        title={t('faq.meta_title')} 
        description={t('faq.meta_description')} 
      />
      <Hero
        badge={t('faq.badge')}
        title={t('faq.title')}
        subtitle={t('faq.subtitle')}
        height="min-h-[420px]"
      />

      <div className="mx-auto max-w-[1200px] py-20 animate-fadeUp">
        <section className="nepal-card p-10 sm:p-20 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-125" />
          
          <div className="relative z-10">
            <SectionHeader
              eyebrow={t('faq.section_eyebrow')}
              title={t('faq.section_title')}
              subtitle={t('faq.section_subtitle')}
            />
            
            <div className="mt-16 space-y-6">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-[28px] bg-white border border-slate-50 p-8 shadow-soft hover:shadow-lg transition-all group/faq">
                  <h3 className="text-xl font-bold text-ink group-hover/faq:text-brandRed transition-colors leading-tight">{t(item.q)}</h3>
                  <p className="mt-4 text-md leading-relaxed text-muted font-medium">{t(item.a)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
