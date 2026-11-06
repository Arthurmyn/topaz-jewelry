"use client";

import { useEffect, useState } from "react";
import { ru } from "@/content/ru";
import { adminFetch } from "@/lib/admin-api";
import type { FieldConfig } from "@/lib/admin-resources";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { Row } from "./data-table";

type Option = { id: number; label: string };

function RelationSelect({
  field,
  value,
  onChange,
  excludeId,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: number | null) => void;
  excludeId?: number;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!field.relation) return;
    const { endpoint, labelKey } = field.relation;
    adminFetch<{ items: Row[] }>(`${endpoint}?page_size=100`).then((d) =>
      setOptions(d.items.map((r) => ({ id: Number(r.id), label: String(r[labelKey]) }))),
    );
  }, [field.relation]);
  return (
    <Select
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">—</option>
      {options
        .filter((o) => o.id !== excludeId)
        .map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
    </Select>
  );
}

export function ResourceForm({
  fields,
  labels,
  initial,
  error,
  onSubmit,
  onCancel,
}: {
  fields: FieldConfig[];
  labels: Record<string, string>;
  initial: Row | null;
  error: string | null;
  onSubmit: (values: Row) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Row>(() => {
    const v: Row = {};
    for (const f of fields) {
      v[f.name] = initial?.[f.name] ?? (f.type === "boolean" ? true : f.type === "number" ? 0 : "");
    }
    return v;
  });
  const [busy, setBusy] = useState(false);
  const set = (name: string, value: unknown) => setValues((p) => ({ ...p, [name]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload: Row = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.type === "number") payload[f.name] = v === "" || v === null ? null : Number(v);
      else if (f.type === "relation") payload[f.name] = v === "" ? null : v;
      else if (f.type === "text" || f.type === "textarea") payload[f.name] = v === "" ? null : v;
      else payload[f.name] = v;
    }
    try {
      await onSubmit(payload);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === "boolean" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => set(f.name, e.target.checked)}
                className="accent-gold size-4"
              />
              {labels[f.name]}
            </label>
          ) : (
            <>
              <Label htmlFor={f.name}>{labels[f.name]}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : f.type === "relation" ? (
                <RelationSelect
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => set(f.name, v)}
                  excludeId={initial ? Number(initial.id) : undefined}
                />
              ) : (
                <Input
                  id={f.name}
                  type={f.type === "number" ? "number" : "text"}
                  step={f.type === "number" ? "any" : undefined}
                  required={f.required}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </>
          )}
        </div>
      ))}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {ru.admin.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {ru.admin.cancel}
        </Button>
      </div>
    </form>
  );
}
