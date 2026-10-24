import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { sectionMap, sectionsQuery, teamQuery } from "@/lib/queries";
import arduinoLab from "@/assets/arduino-lab.jpg";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About Epaws Solutions — Coding Education in Kenya" },
      {
        name: "description",
        content:
          "Epaws Solutions is a Kenyan IT company building coding skills in schools and communities across Africa. Our story, vision and values.",
      },
      { property: "og:title", content: "About Epaws Solutions" },
      { property: "og:url", content: "https://epawssolution.lovable.app/about" },
      {
        property: "og:description",
        content: "Why we build coding skills in African schools, and how we got here.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolution.lovable.app/about" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sectionsQuery("about")),
      context.queryClient.ensureQueryData(teamQuery()),
    ]);
  },
  component: AboutPage,
});

function AboutPage() {
  const { data: sections } = useSuspenseQuery(sectionsQuery("about"));
  const { data: team } = useSuspenseQuery(teamQuery());
  const s = sectionMap(sections);

  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={s["story"]?.heading ?? "Our story"}
        intro={s["story"]?.body}
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
        <img
          src={arduinoLab}
          alt="Students in Kenya building an Arduino project together"
          loading="lazy"
          width={1408}
          height={1008}
          className="rounded-3xl object-cover shadow-lg"
        />
        <div className="grid gap-8">
          {["vision", "values", "why-africa"].map((key) =>
            s[key] ? (
              <div key={key}>
                <h2 className="text-2xl font-bold">{s[key].heading}</h2>
                <p className="mt-3 text-muted-foreground">{s[key].body}</p>
              </div>
            ) : null,
          )}
        </div>
      </section>

      {team.length > 0 ? (
        <section className="surface-sand py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold">The people behind Epaws</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <article key={member.id} className="card-elevated p-6">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="py-16">
        <CtaBand />
      </div>
    </div>
  );
}
