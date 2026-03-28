import { BottomNav } from "@/components/nav/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 pb-16 overflow-y-auto" suppressHydrationWarning>{children}</main>
      <BottomNav />
    </div>
  );
}
