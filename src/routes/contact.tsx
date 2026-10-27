import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { sectionMap, sectionsQuery, servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  validateSearch: z.object({ service: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Contact Epaws Solutions — Request a Meeting or Quote" },
      {
        name: "description",
        content:
          "Talk to the Epaws Solutions team in Nairobi about coding programmes, IT consultancy, networking or licensing. We reply within one working day.",
      },
      { property: "og:title", content: "Contact Epaws Solutions" },
      { property: "og:url", content: "https://epawssolutions/contact" },
      {
        property: "og:description",
        content: "Request a meeting or a quote for your school or organisation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolutions/contact" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sectionsQuery("contact")),
      context.queryClient.ensureQueryData(servicesQuery()),
    ]);
  },
  component: ContactPage,
});

function ContactPage() {
  const { service } = Route.useSearch();
  const { data: sections } = useSuspenseQuery(sectionsQuery("contact"));
  const { data: services } = useSuspenseQuery(servicesQuery());
  const s = sectionMap(sections);

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title={s["intro"]?.heading ?? "Talk to us"}
        intro={s["intro"]?.body}
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold">Reach us directly</h2>
            <ul className="mt-4 grid gap-4 text-sm">
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href="tel:+254797181963">+254797181963</a>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href="https://wa.me/254743288024">WhatsApp us on +254743288024</a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="grid gap-1">
                  <span className="text-muted-foreground">
                    General: <a href="mailto:info@epawssolutions.com">info@epawssolutions.com</a>
                  </span>
                  <span className="text-muted-foreground">
                    Sales: <a href="mailto:sales@epawssolutions.com">sales@epawssolutions.com</a>
                  </span>
                  <span className="text-muted-foreground">
                    Support:{" "}
                    <a href="mailto:support@epawssolutions.com">support@epawssolutions.com</a>
                  </span>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">Nairobi, Kenya · serving Africa-wide</span>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Map of Nairobi, Kenya"
              src="https://www.openstreetmap.org/export/embed.html?bbox=36.75%2C-1.36%2C36.93%2C-1.22&layer=mapnik"
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>

        <EnquiryForm
          kind="meeting"
          services={services.map((x) => ({ slug: x.slug, title: x.title }))}
          {...(service ? { defaultService: service } : {})}
          submitLabel="Request a meeting"
        />
      </section>
    </div>
  );
}
