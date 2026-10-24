import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean";
  required?: boolean;
  rows?: number;
};

type Row = Record<string, unknown>;

type Result = { data: Row[] | null; error: { message: string } | null };
type Eq = { eq: (column: string, value: string) => PromiseLike<Result> };
type LooseTable = {
  select: (columns: string) => { order: (column: string) => PromiseLike<Result> };
  insert: (values: Row) => PromiseLike<Result>;
  update: (values: Row) => Eq;
  delete: () => Eq;
};

// The generated Supabase types require a literal table name; this manager is
// intentionally generic across content tables, so we use a narrow structural shim.
const db = supabase as unknown as { from: (table: string) => LooseTable };

export function CollectionManager({
  table,
  title,
  description,
  fields,
  orderBy = "sort_order",
  titleField,
  subtitleField,
  allowCreate = true,
}: {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  orderBy?: string;
  titleField: string;
  subtitleField?: string;
  allowCreate?: boolean;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await db.from(table).select("*").order(orderBy);
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const { id, ...values } = row;
      const payload: Row = {};
      for (const field of fields) {
        let value = values[field.name];
        if (field.type === "number") value = value === "" || value == null ? null : Number(value);
        if (field.type === "boolean") value = Boolean(value);
        payload[field.name] = value ?? (field.type === "boolean" ? false : "");
      }
      const query = id
        ? db.from(table).update(payload).eq("id", id as string)
        : db.from(table).insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Deleted");
      void qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {allowCreate ? (
          <Button onClick={() => setEditing({})}>
            <Plus className="size-4" /> Add new
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {rows.map((row) => (
          <div
            key={String(row["id"])}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{String(row[titleField] ?? "Untitled")}</p>
              {subtitleField ? (
                <p className="truncate text-sm text-muted-foreground">
                  {String(row[subtitleField] ?? "")}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(row)}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Delete this item permanently?"))
                    remove.mutate(String(row["id"]));
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : null}
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.["id"] ? `Edit ${title}` : `New ${title}`}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              id="collection-form"
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const next: Row = { ...editing };
                for (const field of fields) {
                  next[field.name] =
                    field.type === "boolean" ? fd.get(field.name) === "on" : fd.get(field.name);
                }
                save.mutate(next);
              }}
            >
              {fields.map((field) => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={field.rows ?? 5}
                      defaultValue={String(editing[field.name] ?? "")}
                      required={field.required ?? false}
                    />
                  ) : field.type === "boolean" ? (
                    <Switch
                      id={field.name}
                      name={field.name}
                      defaultChecked={Boolean(editing[field.name])}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type === "number" ? "number" : "text"}
                      defaultValue={String(editing[field.name] ?? "")}
                      required={field.required ?? false}
                    />
                  )}
                </div>
              ))}
            </form>
          ) : null}
          <DialogFooter>
            <Button type="submit" form="collection-form" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
