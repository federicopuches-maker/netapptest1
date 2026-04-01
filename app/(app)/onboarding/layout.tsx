export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Full-screen overlay — hides app chrome (bottom nav) during onboarding
  return (
    <div className="fixed inset-0 bg-white z-[70] overflow-y-auto">
      {children}
    </div>
  );
}
