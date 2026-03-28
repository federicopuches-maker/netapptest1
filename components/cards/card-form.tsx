import { useState } from "react";
import { slugify } from "@/lib/slugify";
import type { CardFormValues } from "@/lib/types";

interface CardFormProps {
  initialValues: CardFormValues;
  onSubmit: (values: CardFormValues) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

const inputClass =
  "w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-accent transition-colors";

const fields: { key: keyof CardFormValues; label: string; type?: string; placeholder: string }[] = [
  { key: "title", label: "Card title", placeholder: "e.g. Professional, Personal" },
  { key: "name", label: "Full name", placeholder: "Jane Smith" },
  { key: "job_title", label: "Job title", placeholder: "Product Designer" },
  { key: "company", label: "Company", placeholder: "Acme Inc." },
  { key: "email", label: "Email", type: "email", placeholder: "jane@acme.com" },
  { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 000 0000" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/janesmith" },
];

export function CardForm({ initialValues, onSubmit, submitLabel, loading }: CardFormProps) {
  const [values, setValues] = useState<CardFormValues>(initialValues);

  const handleChange = (key: keyof CardFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map(({ key, label, type = "text", placeholder }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{label}</label>
          <input
            type={type}
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            required={key === "title"}
            className={inputClass}
          />
          {key === "title" && values.title && (
            <p className="text-xs text-black/40">
              URL slug: <span className="font-mono">{slugify(values.title)}</span>
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading || !values.title}
        className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-md disabled:opacity-50 transition-opacity mt-2"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
