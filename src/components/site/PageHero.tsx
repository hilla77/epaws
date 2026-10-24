import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string | undefined;
  title: string;
  intro?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <section className="surface-hero">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-widest text-gold uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-5 max-w-2xl text-lg text-ink-muted">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
