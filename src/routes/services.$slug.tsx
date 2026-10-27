import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { serviceQuery, servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/services/$slug")({
  staticData: { sitemap: true },
  loader: async ({ context, params }) => {
    const [service] = await Promise.all([
      context.queryClient.ensureQueryData(serviceQuery(params.slug)),
      context.queryClient.ensureQueryData(servicesQuery()),
    ]);
    if (!service) throw notFound();
    return { title: service.title, summary: service.summary };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Epaws Solutions`;
    const url = `https://epawssolutions/services/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.summary },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: loaderData.title,
            description: loaderData.summary,
            provider: {
              "@type": "Organization",
              name: "Epaws Solutions",
              url: "https://epawssolutions",
            },
            areaServed: "Kenya",
          }),
        },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: service } = useSuspenseQuery(serviceQuery(slug));
  const { data: services } = useSuspenseQuery(servicesQuery());

  if (!service) return null;

  const blocks = [
    { label: "What's included", value: service.description },
    { label: "Who it's for", value: service.audience },
    { label: "Pricing", value: service.pricing },
    { label: "How it runs", value: service.process },
  ].filter((b) => b.value);

  return (
    <div>
      <PageHero eyebrow="Service" title={service.title} intro={service.summary}>
        <Button asChild size="lg" className="mt-8">
          <Link to="/contact" search={{ service: service.title }}>
            Request a quote
          </Link>
        </Button>
      </PageHero>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-16">
        {blocks.map((block) => (
          <div key={block.label} className="card-elevated p-6 sm:p-8">
            <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">
              {block.label}
            </h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{block.value}</p>
          </div>
        ))}
      </section>

      <section className="surface-sand py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Other services</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => s.slug !== service.slug)
              .map((s) => (
                <Link
                  key={s.id}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="card-elevated p-5"
                >
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
