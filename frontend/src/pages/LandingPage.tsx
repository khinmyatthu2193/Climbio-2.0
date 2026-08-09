import { useCallback, useEffect, useState } from 'react';
import { FloatingNavbar } from '@/components/landing/LandingHeader';
import { LandingAuthDialog } from '@/components/landing/LandingAuthDialog';
import { HeroSection } from '@/components/landing/LandingHero';
import { ProductBento } from '@/components/landing/ProductBento';
import { BusinessWorkflow, OnboardingTimeline, ProductShowcase } from '@/components/landing/LandingExperience';
import { AISection, FinalCTA, LandingFooter, SecuritySection, StorefrontSection } from '@/components/landing/LandingTrust';
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
      <div className="min-h-screen overflow-x-clip bg-[#faf9f7] text-stone-900 transition-colors dark:bg-stone-950 dark:text-white">
        <FloatingNavbar theme={theme} onToggleTheme={toggleTheme} onOpenAuth={openAuth} />
        <HeroSection onOpenAuth={openAuth} />
        <ProductBento />
        <BusinessWorkflow />
        <ProductShowcase />
        <OnboardingTimeline />
        <AISection />
        <StorefrontSection />
        <SecuritySection />
        <FinalCTA onOpenAuth={openAuth} />
        <LandingFooter onOpenAuth={openAuth} />
      </div>
      <LandingAuthDialog mode={authMode} onClose={closeAuth} onChangeMode={openAuth} />
    </main>
  );
}
