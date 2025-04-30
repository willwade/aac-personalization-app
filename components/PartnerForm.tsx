import React, { useState } from "react";
import { Person } from "@/lib/types";

const circleOptions = [
  { value: 1, label: "Family" },
  { value: 2, label: "Friends" },
  { value: 3, label: "Acquaintances" },
  { value: 4, label: "Paid Workers" },
  { value: 5, label: "Unfamiliar Partners" },
];

const freqOptions = [
  "daily", "weekly", "monthly", "rarely"
];

export type PartnerFormProps = {
  initial?: Partial<Person>;
  onSave: (person: Person) => void;
  onCancel?: () => void;
};

export default function PartnerForm({ initial = {}, onSave, onCancel }: PartnerFormProps) {
  const [form, setForm] = useState<Partial<Person>>(initial);
  const handleChange = (field: keyof Person, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }));
  };
  const handleTopicsChange = (val: string) => {
    handleChange("commonTopics", val.split(",").map((s) => s.trim()).filter(Boolean));
  };
  return (
    <form className="space-y-4 max-w-lg mx-auto p-4" onSubmit={e => { e.preventDefault(); onSave(form as Person); }}>
      <div>
        <label className="block font-medium">Name</label>
        <input className="w-full border rounded p-2" value={form.name || ""} onChange={e => handleChange("name", e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium">Role/Relationship</label>
        <input className="w-full border rounded p-2" value={form.role || ""} onChange={e => handleChange("role", e.target.value)} placeholder="e.g. friend, teacher, wife" />
      </div>
      <div>
        <label className="block font-medium">Circle</label>
        <select className="w-full border rounded p-2" value={form.circle || ""} onChange={e => handleChange("circle", Number(e.target.value))} required>
          <option value="">Select circle</option>
          {circleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium">Communication Frequency</label>
        <select className="w-full border rounded p-2" value={form.communicationFrequency || ""} onChange={e => handleChange("communicationFrequency", e.target.value)}>
          <option value="">Select frequency</option>
          {freqOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium">Communication Style</label>
        <input className="w-full border rounded p-2" value={form.communicationStyle || ""} onChange={e => handleChange("communicationStyle", e.target.value)} placeholder="e.g. Informal, affectionate" />
      </div>
      <div>
        <label className="block font-medium">Common Topics (comma separated)</label>
        <input className="w-full border rounded p-2" value={form.commonTopics?.join(", ") || ""} onChange={e => handleTopicsChange(e.target.value)} placeholder="e.g. Family, Sports, Work" />
      </div>
      <div>
        <label className="block font-medium">Notes</label>
        <textarea className="w-full border rounded p-2" value={form.notes || ""} onChange={e => handleChange("notes", e.target.value)} rows={2} />
      </div>
      <div className="flex gap-4 mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Save</button>
        {onCancel && <button className="px-4 py-2 bg-gray-400 text-white rounded" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
