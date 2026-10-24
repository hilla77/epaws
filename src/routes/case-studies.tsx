import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { caseStudiesQuery, testimonialsQuery } from "@/lib/queries";

export const Route = createFileRoute("/case-studies")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Case Studies — Schools We've Worked With | Epaws Solutions" },
      {
        name: "description",
        content:
          "Real outcomes from Kenyan schools and organisations: coding clubs, computer labs, campus networks and robotics pathways.",
      },
      { property: "og:title", content: "Case Studies — Epaws Solutions" },
      { property: "og:url", content: "https://epawssolution.lovable.app/case-studies" },
      {
        property: "og:description",
        content: "Schools and clients we've served, and what changed for them.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolution.lovable.app/case-studies" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(caseStudiesQuery()),
      context.queryClient.ensureQueryData(testimonialsQuery()),
    ]);
  },
  component: CaseStudiesPage,
});

function CaseStudiesPage() {
  const { data: cases } = useSuspenseQuery(caseStudiesQuery());
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery());

  return (
    <div>
      <PageHero
        eyebrow="Case studies"
        title="Work we're proud of"
        intro="A look at what we've built with schools and organisations across Kenya."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {cases.map((item) => (
            <article key={item.id} className="card-elevated flex flex-col p-6">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                {item.client}
                {item.location ? ` · ${item.location}` : ""}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{item.summary}</p>
              <p className="mt-4 border-t border-border pt-4 text-sm font-medium">{item.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="surface-sand py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold">What partners say</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="card-elevated p-6">
                  <blockquote className="text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {t.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t.role}
                      {t.organisation ? `, ${t.organisation}` : ""}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="py-16">
        <CtaBand
          title="Your school could be next"
          body="Tell us what you want your learners to be able to do, and we'll design the path."
        />
      </div>
    </div>
  );
}
