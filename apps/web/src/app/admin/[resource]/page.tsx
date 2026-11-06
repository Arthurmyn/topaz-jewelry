"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { ResourcePage } from "@/components/admin/resource-page";
import { getResource } from "@/lib/admin-resources";

export default function AdminResourceRoute({ params }: { params: Promise<{ resource: string }> }) {
  const config = getResource(use(params).resource);
  if (!config) notFound();
  return <ResourcePage key={config.key} config={config} />;
}
