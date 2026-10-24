import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { EnquiriesPanel } from "@/components/admin/EnquiriesPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Content Manager — Epaws Solutions" },
      { name: "description", content: "Manage Epaws Solutions website content and enquiries." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Content Manager — Epaws Solutions" },
      { property: "og:description", content: "Internal content management for the Epaws team." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      if (error) throw new Error(error.message);
      return (data ?? []).some((r) => r.role === "admin");
    },
  });

  if (isLoading) {
    return <p className="p-10 text-sm text-muted-foreground">Loading…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-2xl font-bold">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is signed in but is not set up as a website administrator. Ask an existing
          administrator to add you.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content manager</h1>
          <p className="text-sm text-muted-foreground">
            Everything you change here goes live on the website immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/">View website</Link>
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              void navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="enquiries" className="mt-8">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
          <TabsTrigger value="pages">Page text</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="cases">Case studies</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="enquiries" className="mt-8">
          <EnquiriesPanel />
        </TabsContent>

        <TabsContent value="pages" className="mt-8">
          <CollectionManager
            table="page_sections"
            title="Page text"
            description="Headings and paragraphs used on the Home, About, How We Work and Contact pages."
            titleField="heading"
            subtitleField="page"
            allowCreate={false}
            fields={[
              { name: "page", label: "Page", required: true },
              { name: "section_key", label: "Section key", required: true },
              { name: "heading", label: "Heading", required: true },
              { name: "body", label: "Text", type: "textarea", rows: 5 },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-8">
          <CollectionManager
            table="services"
            title="Services"
            titleField="title"
            subtitleField="summary"
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "slug", label: "Web address (slug)", required: true },
              { name: "summary", label: "Short summary", type: "textarea", rows: 3 },
              { name: "description", label: "What's included", type: "textarea", rows: 6 },
              { name: "audience", label: "Who it's for", type: "textarea", rows: 3 },
              { name: "pricing", label: "Pricing", type: "textarea", rows: 3 },
              { name: "process", label: "How it runs", type: "textarea", rows: 3 },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "published", label: "Visible on the website", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="blog" className="mt-8">
          <CollectionManager
            table="blog_posts"
            title="Blog posts"
            titleField="title"
            subtitleField="category"
            orderBy="published_at"
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "slug", label: "Web address (slug)", required: true },
              { name: "category", label: "Category", required: true },
              { name: "excerpt", label: "Summary", type: "textarea", rows: 3 },
              { name: "body", label: "Article", type: "textarea", rows: 12 },
              { name: "cover_url", label: "Cover image URL" },
              { name: "published", label: "Published", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="cases" className="mt-8">
          <CollectionManager
            table="case_studies"
            title="Case studies"
            titleField="title"
            subtitleField="client"
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "client", label: "School or client" },
              { name: "location", label: "Location" },
              { name: "summary", label: "What we did", type: "textarea", rows: 4 },
              { name: "outcome", label: "Outcome", type: "textarea", rows: 3 },
              { name: "image_url", label: "Image URL" },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "published", label: "Visible on the website", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="testimonials" className="mt-8">
          <CollectionManager
            table="testimonials"
            title="Testimonials"
            titleField="name"
            subtitleField="organisation"
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "role", label: "Role" },
              { name: "organisation", label: "Organisation" },
              { name: "quote", label: "Quote", type: "textarea", rows: 4, required: true },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "published", label: "Visible on the website", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="faqs" className="mt-8">
          <CollectionManager
            table="faqs"
            title="FAQs"
            titleField="question"
            subtitleField="topic"
            fields={[
              { name: "topic", label: "Topic", required: true },
              { name: "question", label: "Question", required: true },
              { name: "answer", label: "Answer", type: "textarea", rows: 4, required: true },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "published", label: "Visible on the website", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="gadgets" className="mt-8">
          <CollectionManager
            table="gadgets"
            title="Gadgets"
            titleField="name"
            subtitleField="description"
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "description", label: "Description", type: "textarea", rows: 3 },
              { name: "price_kes", label: "Price (KSh)", type: "number" },
              { name: "image_url", label: "Image URL" },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "published", label: "Visible on the website", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="team" className="mt-8">
          <CollectionManager
            table="team_members"
            title="Team members"
            titleField="name"
            subtitleField="role"
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "role", label: "Role" },
              { name: "bio", label: "Short bio", type: "textarea", rows: 4 },
              { name: "image_url", label: "Photo URL" },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "published", label: "Visible on the website", type: "boolean" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
