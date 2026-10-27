import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqsQuery } from "@/lib/queries";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Epaws Solutions" },
      {
        name: "description",
        content:
          "Answers for schools, parents and organisations about our coding curriculum, licensing, pricing and services across Kenya.",
      },
      { property: "og:title", content: "FAQ — Epaws Solutions" },
      { property: "og:url", content: "https://epawssolutions/faq" },
      {
        property: "og:description",
        content: "Common questions from schools, parents and partners, answered.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolutions/faq" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(faqsQuery());
  },
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqsQuery());
  const topics = [...new Set(faqs.map((f) => f.topic))];

  return (
    <div>
      <PageHero
        eyebrow="FAQ"
        title="Questions we hear often"
        intro="If your question isn't here, send it to us and we'll answer personally."
      />

      <section className="mx-auto max-w-3xl px-4 py-16">
        {topics.map((topic) => (
          <div key={topic} className="mb-10">
            <h2 className="mb-3 text-sm font-semibold tracking-widest text-primary uppercase">
              {topic}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs
                .filter((f) => f.topic === topic)
                .map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {f.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        ))}
      </section>

      <div className="pb-16">
        <CtaBand title="Still have a question?" body="Send it over — we reply within a day." />
      </div>
    </div>
  );
}
