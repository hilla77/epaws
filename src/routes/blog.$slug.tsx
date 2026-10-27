import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { postQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/$slug")({
  staticData: { sitemap: true },
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!post) throw notFound();
    return { title: post.title, excerpt: post.excerpt, publishedAt: post.published_at };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Epaws Solutions`;
    const url = `https://epawssolutions/blog/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.excerpt,
            datePublished: loaderData.publishedAt,
            author: { "@type": "Organization", name: "Epaws Solutions" },
            publisher: { "@type": "Organization", name: "Epaws Solutions" },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  if (!post) return null;

  return (
    <article>
      <div className="surface-ink">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="size-4" /> All articles
          </Link>
          <p className="mt-10 text-xs font-semibold tracking-widest text-accent uppercase">
            {post.category} ·{" "}
            {new Date(post.published_at).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-primary-foreground/75">{post.excerpt}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt=""
            loading="lazy"
            className="mb-10 w-full rounded-2xl object-cover shadow-md"
          />
        ) : null}
        <div className="space-y-6 text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
          {post.body}
        </div>

        <div className="card-elevated mt-14 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-semibold">Want this in your school?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Talk to us about coding programmes, labs and training.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get in touch <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
