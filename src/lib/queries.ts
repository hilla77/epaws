import { queryOptions } from "@tanstack/react-query";
import {
  getServices,
  getService,
  getPosts,
  getPost,
  getCaseStudies,
  getTestimonials,
  getFaqs,
  getGadgets,
  getTeam,
  getSections,
} from "./site.functions";

export const servicesQuery = () =>
  queryOptions({ queryKey: ["services"], queryFn: () => getServices() });

export const serviceQuery = (slug: string) =>
  queryOptions({ queryKey: ["service", slug], queryFn: () => getService({ data: { slug } }) });

export const postsQuery = () => queryOptions({ queryKey: ["posts"], queryFn: () => getPosts() });

export const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["post", slug], queryFn: () => getPost({ data: { slug } }) });

export const caseStudiesQuery = () =>
  queryOptions({ queryKey: ["case-studies"], queryFn: () => getCaseStudies() });

export const testimonialsQuery = () =>
  queryOptions({ queryKey: ["testimonials"], queryFn: () => getTestimonials() });

export const faqsQuery = () => queryOptions({ queryKey: ["faqs"], queryFn: () => getFaqs() });

export const gadgetsQuery = () =>
  queryOptions({ queryKey: ["gadgets"], queryFn: () => getGadgets() });

export const teamQuery = () => queryOptions({ queryKey: ["team"], queryFn: () => getTeam() });

export const sectionsQuery = (page: string) =>
  queryOptions({ queryKey: ["sections", page], queryFn: () => getSections({ data: { page } }) });

export function sectionMap(sections: { section_key: string; heading: string; body: string }[]) {
  return Object.fromEntries(sections.map((s) => [s.section_key, s]));
}
