"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Users, QrCode, Compass } from "lucide-react";

const navItems = [
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/scan", label: "Scan", icon: QrCode },
  { href: "/explore", label: "Explore", icon: Compass },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-black/10 z-50">
      <ul className="flex h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center h-full gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? "text-accent" : "text-black/40"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
