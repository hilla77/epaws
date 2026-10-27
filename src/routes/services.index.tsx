import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/services/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Services — Coding, IT Consultancy & Networking | Epaws" },
      {
        name: "description",
        content:
          "School coding curriculum, IT consultancy, computer networking, content licensing, tech gadgets and CBC digital books for Kenyan schools.",
      },
      { property: "og:title", content: "Services — Epaws Solutions" },
      { property: "og:url", content: "https://epawssolutions/services" },
      {
        property: "og:description",
        content: "Six ways we help schools and organisations build real technology capability.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolutions/services" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(servicesQuery());
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery());

  return (
    <div>
      <PageHero
        eyebrow="Services"
        title="Everything a school needs to teach technology well"
        intro="Pick a starting point. Most partners begin with the curriculum and add consultancy or networking as they grow."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              to="/services/$slug"
              params={{ slug: service.slug }}
              className="card-elevated flex flex-col p-6"
            >
              <h2 className="text-xl font-semibold">{service.title}</h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{service.summary}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Learn more <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="pb-16">
        <CtaBand
          title="Not sure where to start?"
          body="Tell us about your school and we'll recommend the right first step."
        />
      </div>
    </div>
  );
}
