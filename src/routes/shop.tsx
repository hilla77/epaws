import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { gadgetsQuery } from "@/lib/queries";

export const Route = createFileRoute("/shop")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Tech Gadgets & Learning Kits — Epaws Solutions" },
      {
        name: "description",
        content:
          "Arduino kits, robotics components, sensors and lab-ready laptops that support our coding curriculum. Enquiry-based ordering across Kenya.",
      },
      { property: "og:title", content: "Tech Gadgets — Epaws Solutions" },
      { property: "og:url", content: "https://epawssolutions/shop" },
      {
        property: "og:description",
        content: "Learning-ready kits and devices for schools, parents and makers.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolutions/shop" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(gadgetsQuery());
  },
  component: ShopPage,
});

function ShopPage() {
  const { data: gadgets } = useSuspenseQuery(gadgetsQuery());

  return (
    <div>
      <PageHero
        eyebrow="Tech gadgets"
        title="Kit that matches the curriculum"
        intro="Everything here is chosen to work with our lessons. Send an enquiry for current pricing and bulk school rates."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gadgets.map((g) => (
            <article key={g.id} className="card-elevated flex flex-col p-6">
              <h2 className="text-lg font-semibold">{g.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{g.description}</p>
              {g.price_kes ? (
                <p className="mt-4 font-display text-lg font-bold text-primary">
                  KSh {Number(g.price_kes).toLocaleString("en-KE")}
                </p>
              ) : (
                <p className="mt-4 text-sm font-medium">Price on request</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="surface-sand py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Order enquiry</h2>
          <p className="mt-2 text-muted-foreground">
            Tell us what you need and how many, and we'll send a quote with delivery options.
          </p>
          <div className="mt-8">
            <EnquiryForm kind="gadget" submitLabel="Send order enquiry" />
          </div>
        </div>
      </section>
    </div>
  );
}
