import { ru } from "@/content/ru";

/**
 * Admin resources are declared here. To add a CRUD screen:
 * 1) add a crud_router(...) on the backend, 2) add an entry below, 3) add Russian labels to ru.ts.
 * The generic <ResourcePage> renders the table and the form from this config.
 */
export type FieldType = "text" | "textarea" | "number" | "boolean" | "relation";

export interface FieldConfig {
  name: string;
  type: FieldType;
  required?: boolean;
  inTable?: boolean;
  /** For type "relation": endpoint to load options from and which key to show. */
  relation?: { endpoint: string; labelKey: string };
}

export interface ResourceConfig {
  key: keyof typeof ru.admin.resources;
  endpoint: string;
  defaultSort: string;
  fields: FieldConfig[];
}

export const resources: ResourceConfig[] = [
  {
    key: "categories",
    endpoint: "/admin/categories",
    defaultSort: "sort_order",
    fields: [
      { name: "name", type: "text", required: true, inTable: true },
      { name: "slug", type: "text", required: true, inTable: true },
      {
        name: "parent_id",
        type: "relation",
        relation: { endpoint: "/admin/categories", labelKey: "name" },
      },
      { name: "description", type: "textarea" },
      { name: "sort_order", type: "number", inTable: true },
      { name: "is_active", type: "boolean", inTable: true },
      { name: "seo_title", type: "text" },
      { name: "seo_description", type: "textarea" },
    ],
  },
  {
    key: "stones",
    endpoint: "/admin/stones",
    defaultSort: "name",
    fields: [
      { name: "name", type: "text", required: true, inTable: true },
      { name: "slug", type: "text", required: true, inTable: true },
    ],
  },
  {
    key: "stores",
    endpoint: "/admin/stores",
    defaultSort: "city",
    fields: [
      { name: "name", type: "text", required: true, inTable: true },
      { name: "slug", type: "text", required: true },
      { name: "city", type: "text", required: true, inTable: true },
      { name: "address", type: "text", required: true, inTable: true },
      { name: "phone", type: "text", inTable: true },
      { name: "lat", type: "number" },
      { name: "lng", type: "number" },
      { name: "description", type: "textarea" },
      { name: "is_active", type: "boolean", inTable: true },
    ],
  },
];

export function getResource(key: string): ResourceConfig | undefined {
  return resources.find((r) => r.key === key);
}
