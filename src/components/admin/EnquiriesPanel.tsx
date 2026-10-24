import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Enquiry = {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  service: string | null;
  preferred_date: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

export function EnquiriesPanel() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Enquiry[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (row: Enquiry) => {
      const { error } = await supabase
        .from("enquiries")
        .update({ handled: !row.handled })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold">Enquiries</h2>
      <p className="text-sm text-muted-foreground">
        Meeting requests, contact messages and gadget orders sent through the website.
      </p>

      <div className="mt-6 grid gap-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={row.handled ? "secondary" : "default"}>
                {row.handled ? "Handled" : "New"}
              </Badge>
              <Badge variant="outline">{row.kind}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString("en-KE")}
              </span>
            </div>
            <h3 className="mt-3 font-semibold">
              {row.name}
              {row.organisation ? ` · ${row.organisation}` : ""}
            </h3>
            <p className="text-sm text-muted-foreground">
              <a href={`mailto:${row.email}`}>{row.email}</a>
              {row.phone ? ` · ${row.phone}` : ""}
            </p>
            {row.service ? <p className="mt-2 text-sm">Interested in: {row.service}</p> : null}
            {row.preferred_date ? (
              <p className="text-sm">Preferred time: {row.preferred_date}</p>
            ) : null}
            <p className="mt-3 whitespace-pre-line text-sm">{row.message}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => toggle.mutate(row)}
            >
              Mark as {row.handled ? "new" : "handled"}
            </Button>
          </article>
        ))}
        {!isLoading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enquiries yet.</p>
        ) : null}
      </div>
    </div>
  );
}
