"use client";

import { Button } from "@/components/ui/button";
import { useDict } from "@/components/providers/app-providers";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const dict = useDict();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-32 text-ink font-medium">{dict.errors.errorTitle}</h1>
      <p className="text-16 text-muted mt-3">{dict.errors.errorText}</p>
      <Button onClick={reset} className="mt-8">
        {dict.errors.retry}
      </Button>
    </div>
  );
}
