import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/site/CtaBand";
import {
  caseStudiesQuery,
  postsQuery,
  sectionMap,
  sectionsQuery,
  servicesQuery,
  testimonialsQuery,
} from "@/lib/queries";
import heroStudents from "@/assets/hero-students.jpg";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Epaws Solutions — Coding Education & IT Services in Kenya" },
      {
        name: "description",
        content:
          "Epaws Solutions partners with Kenyan schools to deliver hands-on coding education, IT consultancy, networking and CBC digital books. Request a meeting today.",
      },
      { property: "og:title", content: "Epaws Solutions — Coding Education & IT Services" },
      { property: "og:url", content: "https://epawssolution.lovable.app/" },
      {
        property: "og:description",
        content:
          "Hands-on coding curriculum, IT consultancy and networking for schools and organisations across Kenya.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolution.lovable.app/" }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(sectionsQuery("home")),
      context.queryClient.ensureQueryData(servicesQuery()),
      context.queryClient.ensureQueryData(testimonialsQuery()),
      context.queryClient.ensureQueryData(caseStudiesQuery()),
      context.queryClient.ensureQueryData(postsQuery()),
    ]);
  },
  component: Index,
});

const steps = ["Choose a service", "Request a meeting", "Receive a custom plan", "Let's build it"];

function Index() {
  const { data: sections } = useSuspenseQuery(sectionsQuery("home"));
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery());
  const { data: cases } = useSuspenseQuery(caseStudiesQuery());
  const { data: posts } = useSuspenseQuery(postsQuery());
  const s = sectionMap(sections);

  return (
    <div>
      <section className="surface-hero">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold tracking-widest text-gold uppercase">
              Kenya · Africa-wide
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              {s["hero"]?.heading ?? "Nurturing Africa's next generation of tech leaders"}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">{s["hero"]?.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">Request a meeting</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/services">Explore services</Link>
              </Button>
            </div>
          </div>
          <img
            src={heroStudents}
            alt="Kenyan primary school students coding on laptops with their teacher"
            width={1600}
            height={1104}
            className="rounded-3xl object-cover shadow-2xl"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold">{s["mission"]?.heading ?? "Our mission"}</h2>
            <p className="mt-4 text-muted-foreground">{s["mission"]?.body}</p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              More about us <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Curriculum aligned with educational standards",
              "Teacher training included in every programme",
              "CBC digital books for Grades 1 to 4",
              "Support that continues after handover",
            ].map((point) => (
              <div key={point} className="flex gap-3 rounded-xl bg-muted p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-sm font-medium">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-sand py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">What we do</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="card-elevated flex flex-col p-6"
              >
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{service.summary}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Learn more <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">How we work</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step} className="card-elevated p-6">
              <span className="font-display text-3xl font-bold text-accent">0{i + 1}</span>
              <p className="mt-3 font-semibold">{step}</p>
            </li>
          ))}
        </ol>
        <Link
          to="/how-we-work"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          See the full process <ArrowRight className="size-4" />
        </Link>
      </section>

      {cases.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold">Recent work</h2>
            <Link to="/case-studies" className="text-sm font-semibold text-primary">
              All case studies
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {cases.slice(0, 3).map((c) => (
              <article key={c.id} className="card-elevated p-6">
                <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                  {c.client}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{c.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="surface-ink py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold">Trusted by schools and parents</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <figure key={t.id} className="rounded-2xl border border-ink-muted/20 p-6">
                  <blockquote className="text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {t.name}
                    <span className="block text-xs font-normal text-ink-muted">
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

      {posts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold">From the blog</h2>
            <Link to="/blog" className="text-sm font-semibold text-primary">
              All articles
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="card-elevated p-6"
              >
                <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                  {post.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="pb-8">
        <CtaBand />
      </div>
    </div>
  );
}
