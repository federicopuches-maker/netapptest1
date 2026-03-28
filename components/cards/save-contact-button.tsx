"use client";

import type { Card } from "@/lib/types";

interface SaveContactButtonProps {
  card: Card;
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function SaveContactButton({ card }: SaveContactButtonProps) {
  const handleSave = () => {
    const nameParts = card.name.trim().split(/\s+/);
    const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    const vcf = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
      `FN:${escapeVCard(card.name)}`,
      card.company ? `ORG:${escapeVCard(card.company)}` : "",
      card.job_title ? `TITLE:${escapeVCard(card.job_title)}` : "",
      card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
      card.email ? `EMAIL:${card.email}` : "",
      card.linkedin_url ? `URL:${card.linkedin_url}` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleSave}
      className="w-full bg-accent text-white text-sm font-medium py-3 rounded-md transition-opacity active:opacity-80"
    >
      Save contact
    </button>
  );
}
