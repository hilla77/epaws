import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CtaBand({
  title = "Ready to bring coding to your school?",
  body = "Tell us where you are and we'll put together a plan that fits your timetable and budget.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="surface-hero rounded-3xl px-6 py-12 text-center sm:px-12">
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-muted">{body}</p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/contact">Request a meeting</Link>
        </Button>
      </div>
    </section>
  );
}
