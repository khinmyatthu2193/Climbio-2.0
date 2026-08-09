import { useCallback, useEffect, useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingAuthDialog } from '@/components/landing/LandingAuthDialog';
import {
  AudienceSection,
  FeaturesSection,
  FinalCTA,
  HeroSection,
  HowItWorksSection,
  LandingFooter,
  SecuritySection,
  WorkflowSection,
} from '@/components/landing/LandingSections';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

export type LandingAuthMode = 'login' | 'signup';

function authenticatedDestination(user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>) {
  if (user.role === 'ADMIN') return '/admin/dashboard';
  if (user.accountStatus !== 'ACTIVE' || user.approvalStatus !== 'APPROVED') return '/application';
  return '/';
}

export function LandingPage({ initialAuthMode = null }: { initialAuthMode?: LandingAuthMode | null }) {
  const [authMode, setAuthMode] = useState<LandingAuthMode | null>(initialAuthMode);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setAuthMode(initialAuthMode), [initialAuthMode]);
  useEffect(() => { if (user) window.location.replace(authenticatedDestination(user)); }, [user]);

  const openAuth = useCallback((mode: LandingAuthMode) => {
    setAuthMode(mode);
    window.history.pushState({}, '', mode === 'login' ? '/account/login' : '/account/signup');
  }, []);

  const closeAuth = useCallback(() => {
    setAuthMode(null);
    window.history.pushState({}, '', '/');
  }, []);

  if (user) return null;

  return (
    <main className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen overflow-x-clip bg-[#fbfaff] text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
        <LandingHeader theme={theme} onToggleTheme={toggleTheme} onOpenAuth={openAuth} />
        <HeroSection onOpenAuth={openAuth} />
        <FeaturesSection />
        <HowItWorksSection />
        <WorkflowSection />
        <SecuritySection onOpenAuth={openAuth} />
        <AudienceSection />
        <FinalCTA onOpenAuth={openAuth} />
        <LandingFooter onOpenAuth={openAuth} />
      </div>
      <LandingAuthDialog mode={authMode} onClose={closeAuth} onChangeMode={openAuth} />
    </main>
  );
}
