"use client";

import { ru } from "@/content/ru";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">{ru.errors.errorTitle}</h1>
      <p className="text-muted mt-3">{ru.errors.errorText}</p>
      <Button onClick={reset} className="mt-8">
        {ru.errors.retry}
      </Button>
    </div>
  );
}
