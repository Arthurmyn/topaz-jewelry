"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/content/site";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/text";
import { useDict } from "@/components/providers/app-providers";

type Message = { id: number; from: "bot" | "user"; text: string };

const pill =
  "text-13 w-full rounded-pill border border-ink px-3.5 py-2.5 text-center font-medium text-ink transition-colors hover:bg-soft";
const pillDark =
  "text-13 w-full rounded-pill border border-ink bg-ink px-3.5 py-2.5 text-center font-medium text-white transition-colors hover:bg-dark";

/**
 * Button-based support bot (no LLM). The Q&A tree lives in the dictionary (`chat.questions`),
 * so copy can be edited in one place. Always offers a hand-off to WhatsApp.
 */
export function SupportChat() {
  const dict = useDict();
  const chat = dict.chat;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: chat.greeting },
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);

  const active = chat.questions.find((q) => q.id === activeId) ?? null;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);

  function push(from: Message["from"], text: string) {
    setMessages((m) => [...m, { id: nextId.current++, from, text }]);
  }

  function ask(id: string) {
    const q = chat.questions.find((x) => x.id === id);
    if (!q) return;
    push("user", q.q);
    push("bot", q.a);
    setActiveId(id);
  }

  function backToQuestions() {
    push("bot", chat.greeting);
    setActiveId(null);
  }

  function close() {
    setOpen(false);
    openButton.current?.focus();
  }

  const whatsappText = active
    ? fmt(chat.whatsappPrefill, { question: active.q })
    : chat.whatsappPrefillGeneral;
  const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  if (!open) {
    return (
      <button
        ref={openButton}
        type="button"
        aria-label={chat.open}
        onClick={() => setOpen(true)}
        className="bg-dark text-13 right-header fixed bottom-6 z-50 flex size-14 items-center justify-center rounded-full font-medium text-white shadow-[0_8px_24px_rgba(26,26,26,0.2)] transition-transform duration-150 hover:scale-105 active:scale-95 motion-reduce:transition-none"
      >
        {chat.openLabel}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={chat.title}
      onKeyDown={(e) => e.key === "Escape" && close()}
      className="rounded-chat border-border right-header fixed bottom-6 z-50 flex max-h-[calc(100dvh-48px)] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden border bg-white"
    >
      <div className="bg-dark flex items-center justify-between px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-15 font-medium text-white">{chat.title}</p>
          <p className="text-12 text-muted-on-dark">{chat.subtitle}</p>
        </div>
        <button
          ref={closeButton}
          type="button"
          aria-label={chat.close}
          onClick={close}
          className="text-14 -m-2 p-2 text-white"
        >
          ✕
        </button>
      </div>

      <div
        ref={scroller}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
        aria-live="polite"
      >
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "user" && "justify-end")}>
            <p
              className={cn(
                "text-14 rounded-bubble px-3.5 py-2.5 leading-5",
                m.from === "bot"
                  ? "bg-soft text-ink max-w-[290px]"
                  : "bg-ink max-w-[220px] text-white",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}

        <div className="flex flex-col gap-2 pt-1">
          {active ? (
            <>
              {active.actions.map((a) => (
                <Link key={a.href} href={a.href} className={pill}>
                  {a.label}
                </Link>
              ))}
              <button type="button" onClick={backToQuestions} className={pill}>
                {chat.back}
              </button>
            </>
          ) : (
            chat.questions.map((q) => (
              <button key={q.id} type="button" onClick={() => ask(q.id)} className={pill}>
                {q.q}
              </button>
            ))
          )}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={pillDark}>
            {chat.whatsapp}
          </a>
        </div>
      </div>

      <p className="text-12 text-muted border-border border-t px-4 py-3 text-center">
        {chat.footer}
      </p>
    </div>
  );
}
