"use client";

import { useCallback, useEffect, useState } from "react";
import { ru } from "@/content/admin-ru";
import { AdminApiError, adminFetch } from "@/lib/admin-api";
import type { ResourceConfig } from "@/lib/admin-resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Row } from "./data-table";
import { ResourceForm } from "./resource-form";

const PAGE_SIZE = 25;

/** Generic list + create/edit/delete screen driven entirely by a ResourceConfig. */
export function ResourcePage({ config }: { config: ResourceConfig }) {
  const meta = ru.admin.resources[config.key];
  const labels = meta.fields as Record<string, string>;
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(config.defaultSort);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE), sort });
    if (q) params.set("q", q);
    const data = await adminFetch<{ items: Row[]; total: number }>(
      `${config.endpoint}?${params.toString()}`,
    );
    setRows(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [config.endpoint, page, sort, q]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleSort(field: string) {
    setSort((s) => (s === field ? `-${field}` : field));
  }

  const errorText = (e: unknown) =>
    ru.admin.errors[e instanceof AdminApiError ? e.code : "generic"] ?? ru.admin.errors.generic;

  async function save(values: Row) {
    setFormError(null);
    try {
      if (editing === "new") {
        await adminFetch(config.endpoint, { method: "POST", body: JSON.stringify(values) });
      } else if (editing) {
        await adminFetch(`${config.endpoint}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
      }
      setEditing(null);
      await load();
    } catch (e) {
      setFormError(errorText(e));
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(ru.admin.deleteConfirm)) return;
    try {
      await adminFetch(`${config.endpoint}/${row.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      window.alert(errorText(e));
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">{meta.title}</h1>
        <Button
          onClick={() => {
            setFormError(null);
            setEditing("new");
          }}
        >
          {ru.admin.create}
        </Button>
      </div>

      <div className="my-4 max-w-sm">
        <Input
          placeholder={ru.admin.search}
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
      </div>

      {loading && rows.length === 0 ? (
        <p className="text-muted">{ru.admin.loading}</p>
      ) : (
        <DataTable
          columns={config.fields.filter((f) => f.inTable)}
          labels={labels}
          rows={rows}
          sort={sort}
          onSort={toggleSort}
          onEdit={(r) => {
            setFormError(null);
            setEditing(r);
          }}
          onDelete={remove}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {ru.catalog.prev}
          </Button>
          <span>{ru.catalog.page(page, totalPages)}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {ru.catalog.next}
          </Button>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-paper h-full w-full max-w-md overflow-y-auto p-6">
            <h2 className="mb-4 font-serif text-2xl">
              {editing === "new" ? ru.admin.create : ru.admin.edit}
            </h2>
            <ResourceForm
              fields={config.fields}
              labels={labels}
              initial={editing === "new" ? null : editing}
              error={formError}
              onSubmit={save}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
