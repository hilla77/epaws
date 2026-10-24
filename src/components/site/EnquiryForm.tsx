import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnquiry } from "@/lib/site.functions";

type Props = {
  kind: "contact" | "meeting" | "gadget";
  services?: { slug: string; title: string }[];
  defaultService?: string;
  submitLabel?: string;
};

export function EnquiryForm({ kind, services = [], defaultService, submitLabel }: Props) {
  const send = useServerFn(submitEnquiry);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) =>
      send({
        data: {
          kind,
          name: data["name"] ?? "",
          email: data["email"] ?? "",
          phone: data["phone"] ?? null,
          organisation: data["organisation"] ?? null,
          service: data["service"] ?? defaultService ?? null,
          preferred_date: data["preferred_date"] ?? null,
          message: data["message"] ?? "",
          website: data["website"] ?? null,
        },
      }),
    onSuccess: () => {
      setDone(true);
      toast.success("Thank you — we'll be in touch within one working day.");
    },
    onError: () => toast.error("Something went wrong. Please try again or email us directly."),
  });

  if (done) {
    return (
      <div className="card-elevated p-8 text-center">
        <h3 className="text-xl font-semibold">Message received</h3>
        <p className="mt-2 text-muted-foreground">
          Thank you for reaching out. A member of the Epaws team will reply within one working day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      className="card-elevated grid gap-4 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        mutation.mutate(Object.fromEntries(fd) as Record<string, string>);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required minLength={2} autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone or WhatsApp</Label>
          <Input id="phone" name="phone" autoComplete="tel" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="organisation">School or organisation</Label>
          <Input id="organisation" name="organisation" autoComplete="organization" />
        </div>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-2">
          <Label htmlFor="service">What are you interested in?</Label>
          <select
            id="service"
            name="service"
            defaultValue={defaultService ?? services[0]?.title}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </div>
      ) : null}

      {kind === "meeting" ? (
        <div className="grid gap-2">
          <Label htmlFor="preferred_date">Preferred date and time</Label>
          <Input id="preferred_date" name="preferred_date" placeholder="e.g. Tuesday morning" />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <Button type="submit" size="lg" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : (submitLabel ?? "Send message")}
      </Button>
      <p className="text-xs text-muted-foreground">
        We use your details only to reply to this enquiry.
      </p>
    </form>
  );
}
