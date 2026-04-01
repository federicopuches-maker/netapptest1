"use client";

import { useEffect, useState } from "react";
import { Copy, MessageCircle, Mail, X, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Card } from "@/lib/types";

interface ShareSheetProps {
  card: Card;
  username: string;
  onClose: () => void;
}

export function ShareSheet({ card, username, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${appUrl}/card/${username}/${card.slug}`;

  // Lock body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    {
      label: copied ? "Copied!" : "Copy link",
      icon: copied ? Check : Copy,
      onClick: handleCopy,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`),
    },
    {
      label: "Email",
      icon: Mail,
      onClick: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(card.name)}&body=${encodeURIComponent(url)}`
        ),
    },
    {
      label: "Close",
      icon: X,
      onClick: onClose,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-black/20 rounded-full mx-auto mb-5" />

        <p className="text-sm font-semibold text-center mb-5">{card.name}</p>

        {/* QR code */}
        <div className="flex justify-center mb-5">
          <QRCodeSVG value={url} size={160} fgColor="#1a2744" bgColor="#ffffff" />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-3">
          {actions.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 p-3 border border-black/10 rounded-xl text-xs font-medium hover:bg-black/[0.02] transition-colors"
            >
              <Icon size={20} strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
