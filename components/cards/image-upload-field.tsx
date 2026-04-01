"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";

interface ImageUploadFieldProps {
  cardId: string;
  field: "photo_url" | "logo_url";
  currentUrl: string | null;
  shape: "circle" | "square";
  label: string;
  onUploaded: (url: string) => void;
}

export function ImageUploadField({
  cardId,
  field,
  currentUrl,
  shape,
  label,
  onUploaded,
}: ImageUploadFieldProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const filename = field === "photo_url" ? "photo" : "logo";
    const path = `${user.id}/${cardId}/${filename}`;

    const { error: uploadErr } = await supabase.storage
      .from("card-assets")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setUploadError(uploadErr.message);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const { data } = supabase.storage.from("card-assets").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    const { error: dbErr } = await supabase
      .from("cards")
      .update({ [field]: url })
      .eq("id", cardId);

    if (dbErr) {
      setUploadError(dbErr.message);
    } else {
      onUploaded(url);
    }

    setUploading(false);
    e.target.value = "";
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";
  const sizeClass = shape === "circle" ? "w-16 h-16" : "w-14 h-14";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`${sizeClass} ${shapeClass} border-2 border-dashed border-black/20 flex items-center justify-center overflow-hidden bg-black/[0.02] transition-opacity disabled:opacity-50`}
      >
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <Upload size={16} strokeWidth={1.5} className="text-black/30" />
        )}
      </button>
      <span className="text-xs text-black/40">
        {uploading ? "Uploading…" : label}
      </span>
      {uploadError && (
        <p className="text-xs text-red-500 text-center max-w-[120px]">{uploadError}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
