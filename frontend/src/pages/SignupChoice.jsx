import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageShell from "../components/PageShell.jsx";
import PageMeta from "../components/PageMeta.jsx";
import choiceIcons from "../assets/i18n/choice-icons.png";

export default function SignupChoice() {
  const { t } = useTranslation();
  return (
    <PageShell maxWidth="max-w-[1200px]" noPadding>
      <PageMeta 
        title={t('nav.home')} 
        description={t('onboarding.match_subtitle')} 
      />
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 py-12 animate-fadeUp">
        <div className="text-center max-w-[720px] mb-16">
          <p className="eyebrow">{t('auth.otp_header')}</p>
          <h1 className="mt-6 font-heading text-[48px] font-bold tracking-tight text-ink sm:text-[56px] leading-[1.1]">
            {t('auth.signin_as')}
          </h1>
          <p className="mt-6 text-xl text-muted/90 leading-relaxed">
            {t('onboarding.match_subtitle')}
          </p>
        </div>

        <section className="grid w-full gap-10 md:grid-cols-2">
          {/* Volunteer Choice */}
          <div className="nepal-card relative flex flex-col p-12 overflow-hidden group">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brandRed/5 blur-3xl transition-transform group-hover:scale-150" aria-hidden="true" />
            
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brandRed/10 shadow-sm mb-10 transition-transform group-hover:scale-110 overflow-hidden border border-brandRed/20">
              <img src={choiceIcons} alt="Volunteer" className="h-full w-full object-cover scale-[2] translate-y-[-10%]" />
            </div>
            
            <h2 className="text-3xl font-bold text-ink mb-4 group-hover:text-brandRed transition-colors">
              {t('auth.signin_as')} (Volunteer)
            </h2>
            <p className="text-lg leading-8 text-muted mb-8 flex-1">
              {t('auth.join_community_desc')}
            </p>
            
            <ul className="space-y-4 mb-10">
              {[t('auth.benefit_hours'), t('auth.benefit_badges'), t('auth.benefit_connect')].map((item) => (
                <li key={item} className="flex items-center gap-4 text-sm font-bold text-ink/70">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 border border-emerald-100">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link className="nepal-button w-full text-center" to="/signup">
              {t('auth.start_journey')}
            </Link>
          </div>

          {/* Organization Choice */}
          <div className="nepal-card relative flex flex-col p-12 overflow-hidden group">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brandBlue/5 blur-3xl transition-transform group-hover:scale-150" aria-hidden="true" />
            
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brandBlue/10 shadow-sm mb-10 transition-transform group-hover:scale-110 overflow-hidden border border-brandBlue/20">
              <img src={choiceIcons} alt="Organization" className="h-full w-full object-cover scale-[2] translate-y-[10%]" />
            </div>
            
            <h2 className="text-3xl font-bold text-ink mb-4 group-hover:text-brandBlue transition-colors">
              {t('auth.signin_as')} (Organization)
            </h2>
            <p className="text-lg leading-8 text-muted mb-8 flex-1">
              {t('auth.org_infra_desc')}
            </p>

            <ul className="space-y-4 mb-10">
              {[t('auth.org_benefit_reg'), t('auth.org_benefit_track'), t('auth.org_benefit_dash')].map((item) => (
                <li key={item} className="flex items-center gap-4 text-sm font-bold text-ink/70">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 border border-emerald-100">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link className="nepal-button-secondary w-full text-center hover:bg-slate-50" to="/org-signup">
              {t('auth.become_partner')}
            </Link>
          </div>
        </section>

        <div className="mt-16 text-center border-t border-slate-200 dark:border-slate-800 pt-10 w-full max-w-[720px]">
          <p className="text-[15px] font-bold text-muted/60">
            {t('org.org_workspace_link')}{" "}
            <Link className="text-brandRed hover:underline" to="/login">
              {t('auth.signin')}
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
