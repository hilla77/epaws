import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { postsQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Blog — Coding Education & IT Insights | Epaws Solutions" },
      {
        name: "description",
        content:
          "Articles on teaching coding in African classrooms, planning computer labs, Arduino projects and school technology.",
      },
      { property: "og:title", content: "Epaws Solutions Blog" },
      { property: "og:url", content: "https://epawssolution.lovable.app/blog" },
      {
        property: "og:description",
        content: "Practical writing on coding education and school technology in Kenya.",
      },
    ],
    links: [{ rel: "canonical", href: "https://epawssolution.lovable.app/blog" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQuery());
  },
  component: BlogIndex,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery());
  const [category, setCategory] = useState<string>("All");
  const categories = ["All", ...new Set(posts.map((p) => p.category))];
  const visible = category === "All" ? posts : posts.filter((p) => p.category === category);
  const [featured, ...rest] = visible;

  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Notes from the classroom and the server room"
        intro="What we're learning while building technology capacity in African schools."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={
                c === category
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm"
                  : "rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              }
            >
              {c}
            </button>
          ))}
        </div>

        {featured ? (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="card-elevated group mb-8 grid gap-6 overflow-hidden p-6 sm:p-8 lg:grid-cols-5 lg:items-center"
          >
            <div className="lg:col-span-3">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Featured · {featured.category} · {formatDate(featured.published_at)}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-primary">
                {featured.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read article
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            {featured.cover_url ? (
              <img
                src={featured.cover_url}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover lg:col-span-2"
              />
            ) : (
              <div className="surface-sand hidden aspect-[4/3] rounded-xl lg:col-span-2 lg:block" />
            )}
          </Link>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="card-elevated group flex flex-col p-6"
            >
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                {post.category}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Read
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
          {visible.length === 0 ? (
            <p className="text-muted-foreground">No articles in this category yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
