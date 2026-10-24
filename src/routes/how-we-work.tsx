import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { sectionMap, sectionsQuery } from "@/lib/queries";

const steps = [
  {
    title: "Choose a service",
    body: "Browse our services and pick the starting point that fits — curriculum, consultancy, networking, licensing, gadgets or digital books.",
  },
  {
    title: "Request a meeting",
    body: "Send us a short message. We'll set up a call or a school visit to understand your learners, timetable and constraints.",
  },
  {
    title: "Receive a custom plan",
    body: "You get a written plan with scope, timelines and costs — no surprises, no jargon.",
  },
  {
    title: "Let's make it happen",
    body: "We deliver, train your team and stay available while the programme runs.",
  },
];

export const Route = createFileRoute("/how-we-work")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "How We Work — Epaws Solutions" },
      {
        name: "description",
        content:
          "Four steps from first conversation to a running programme: choose a service, request a meeting, receive a custom plan, and we deliver.",
      },
      { property: "og:title", content: "How We Work — Epaws Solutions" },
      { property: "og:url", content: "https://epawssolution.lovable.app/how-we-work" },
      {
        property: "og:description",
        content: "Our simple four-step process for schools and organisations.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolution.lovable.app/how-we-work" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(sectionsQuery("how-we-work"));
  },
  component: HowWeWorkPage,
});

function HowWeWorkPage() {
  const { data: sections } = useSuspenseQuery(sectionsQuery("how-we-work"));
  const s = sectionMap(sections);

  return (
    <div>
      <PageHero
        eyebrow="Our process"
        title={s["intro"]?.heading ?? "How we work"}
        intro={s["intro"]?.body}
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <ol className="grid gap-6">
          {steps.map((step, i) => (
            <li key={step.title} className="card-elevated flex gap-5 p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="pb-16">
        <CtaBand title="Start at step two" body="Request a meeting and we'll take it from there." />
      </div>
    </div>
  );
}
