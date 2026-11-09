"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/content/site";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/text";
import { useDict } from "@/components/providers/app-providers";

type Message = { id: number; from: "bot" | "user"; text: string };

const pill =
  "text-13 w-full rounded-pill border border-ink px-3.5 py-2.5 text-center font-medium text-ink press hover:bg-soft";
const pillDark =
  "text-13 w-full rounded-pill border border-ink bg-ink px-3.5 py-2.5 text-center font-medium text-white press hover:bg-dark";

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

  return (
    <>
      {/* Launcher: fades and shrinks away while the window opens from the same corner. */}
      <button
        ref={openButton}
        type="button"
        aria-label={chat.open}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
        className={cn(
          "bg-dark text-13 right-header press fixed bottom-6 z-50 flex size-14 items-center justify-center rounded-full font-medium text-white shadow-[0_8px_24px_rgba(26,26,26,0.2)] transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-opacity",
          open
            ? "pointer-events-none invisible scale-75 opacity-0"
            : "visible scale-100 opacity-100",
        )}
      >
        {chat.openLabel}
      </button>

      {/* Window: origin-aware (grows from the launcher corner); closing is the same path, faster. */}
      <div
        role="dialog"
        aria-label={chat.title}
        aria-hidden={!open}
        inert={!open}
        onKeyDown={(e) => e.key === "Escape" && close()}
        className={cn(
          "rounded-chat border-border right-header fixed bottom-6 z-50 flex max-h-[calc(100dvh-48px)] w-[380px] max-w-[calc(100vw-32px)] origin-bottom-right flex-col overflow-hidden border bg-white transition-[opacity,transform,visibility] ease-out motion-reduce:transition-opacity",
          open
            ? "visible translate-y-0 scale-100 opacity-100 duration-200"
            : "pointer-events-none invisible translate-y-2 scale-95 opacity-0 duration-150 motion-reduce:translate-y-0 motion-reduce:scale-100",
        )}
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
            className="text-14 press -m-2 p-2 text-white"
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
            <div key={m.id} className={cn("bubble-in flex", m.from === "user" && "justify-end")}>
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

          <div key={activeId ?? "root"} className="stagger-in flex flex-col gap-2 pt-1">
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
    </>
  );
}
