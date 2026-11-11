"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/components/providers/app-providers";
import { PageIntro, ResultBlock } from "@/components/shop/page-intro";

const validToken = (token: string | null) => Boolean(token && token.length >= 8);

/** Double opt-in confirmation. Frontend-only: any token of 8+ characters counts as valid. */
export function NewsletterConfirmView() {
  const dict = useDict();
  const n = dict.newsletterPages;
  const ok = validToken(useSearchParams().get("token"));
  return (
    <>
      <PageIntro
        crumbs={[
          { label: dict.common.home, href: "/" },
          { label: ok ? n.confirmTitle : n.invalidTitle },
        ]}
        title={ok ? n.confirmTitle : n.invalidTitle}
      />
      <ResultBlock
        title={ok ? n.confirmTitle : n.invalidTitle}
        text={ok ? n.confirmText : n.invalidText}
      >
        <Button asChild>
          <Link href="/">{n.toHome}</Link>
        </Button>
      </ResultBlock>
    </>
  );
}

/** One-click unsubscribe with an explicit confirm step. */
export function NewsletterUnsubscribeView() {
  const dict = useDict();
  const n = dict.newsletterPages;
  const ok = validToken(useSearchParams().get("token"));
  const [done, setDone] = useState(false);
  const title = !ok ? n.invalidTitle : done ? n.unsubscribedTitle : n.unsubscribeTitle;
  return (
    <>
      <PageIntro
        crumbs={[{ label: dict.common.home, href: "/" }, { label: title }]}
        title={title}
      />
      <ResultBlock
        title={title}
        text={!ok ? n.invalidText : done ? n.unsubscribedText : n.unsubscribeText}
      >
        {ok && !done && <Button onClick={() => setDone(true)}>{n.unsubscribeButton}</Button>}
        {(done || !ok) && (
          <Button asChild>
            <Link href="/">{n.toHome}</Link>
          </Button>
        )}
      </ResultBlock>
    </>
  );
}
