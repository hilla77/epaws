import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicClient() {
  return createClient(
    import.meta.env["VITE_SUPABASE_URL"] as string,
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  audience: string;
  pricing: string;
  process: string;
  icon: string;
  sort_order: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  published_at: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  client: string;
  location: string;
  summary: string;
  outcome: string;
  image_url: string | null;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  organisation: string;
  quote: string;
};

export type Faq = { id: string; topic: string; question: string; answer: string };
export type Gadget = {
  id: string;
  name: string;
  description: string;
  price_kes: number | null;
  image_url: string | null;
};
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
};
export type PageSection = { section_key: string; heading: string; body: string };

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("services")
    .select("id,slug,title,summary,description,audience,pricing,process,icon,sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
});

export const getService = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data: input }) => {
    const { data, error } = await publicClient()
      .from("services")
      .select("id,slug,title,summary,description,audience,pricing,process,icon,sort_order")
      .eq("slug", input.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as Service | null;
  });

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("blog_posts")
    .select("id,slug,title,category,excerpt,body,cover_url,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data: input }) => {
    const { data, error } = await publicClient()
      .from("blog_posts")
      .select("id,slug,title,category,excerpt,body,cover_url,published_at")
      .eq("slug", input.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as BlogPost | null;
  });

export const getCaseStudies = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("case_studies")
    .select("id,title,client,location,summary,outcome,image_url")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as CaseStudy[];
});

export const getTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("testimonials")
    .select("id,name,role,organisation,quote")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Testimonial[];
});

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("faqs")
    .select("id,topic,question,answer")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Faq[];
});

export const getGadgets = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("gadgets")
    .select("id,name,description,price_kes,image_url")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Gadget[];
});

export const getTeam = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("team_members")
    .select("id,name,role,bio,image_url")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
});

export const getSections = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ page: z.string() }).parse(d))
  .handler(async ({ data: input }) => {
    const { data, error } = await publicClient()
      .from("page_sections")
      .select("section_key,heading,body")
      .eq("page", input.page)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as PageSection[];
  });

const enquirySchema = z.object({
  kind: z.enum(["contact", "meeting", "gadget"]),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional().nullable(),
  organisation: z.string().max(160).optional().nullable(),
  service: z.string().max(160).optional().nullable(),
  preferred_date: z.string().max(60).optional().nullable(),
  message: z.string().max(4000).default(""),
  website: z.string().optional().nullable(),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => enquirySchema.parse(d))
  .handler(async ({ data: input }) => {
    // Honeypot: silently accept bot submissions without storing them.
    if (input.website) return { ok: true };
    const { website: _ignored, ...row } = input;
    const { error } = await publicClient().from("enquiries").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
