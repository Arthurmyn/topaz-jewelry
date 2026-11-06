"use client";

import { ru } from "@/content/ru";
import type { FieldConfig } from "@/lib/admin-resources";
import { Button } from "@/components/ui/button";

export type Row = Record<string, unknown>;

export function DataTable({
  columns,
  labels,
  rows,
  sort,
  onSort,
  onEdit,
  onDelete,
}: {
  columns: FieldConfig[];
  labels: Record<string, string>;
  rows: Row[];
  sort: string;
  onSort: (field: string) => void;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
}) {
  return (
    <div className="border-line overflow-x-auto border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand">
          <tr>
            {columns.map((c) => (
              <th key={c.name} className="px-3 py-2 font-medium">
                <button type="button" onClick={() => onSort(c.name)} className="hover:underline">
                  {labels[c.name] ?? c.name}
                  {sort === c.name ? " ↑" : sort === `-${c.name}` ? " ↓" : ""}
                </button>
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">{ru.admin.actions}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="text-muted px-3 py-8 text-center">
                {ru.admin.empty}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={String(row.id)} className="border-line border-t">
              {columns.map((c) => (
                <td key={c.name} className="px-3 py-2">
                  {c.type === "boolean" ? (row[c.name] ? "✓" : "—") : String(row[c.name] ?? "")}
                </td>
              ))}
              <td className="space-x-2 px-3 py-2 text-right whitespace-nowrap">
                <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                  {ru.admin.edit}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(row)}>
                  {ru.admin.delete}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
