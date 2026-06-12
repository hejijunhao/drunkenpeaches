"use client";

import { useActionState, useRef, useEffect } from "react";
import { createWineAction } from "@/app/actions/wine";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";

export function WineForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createWineAction.bind(null, slug),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2 flex-1 min-w-48">
        <Label htmlFor="name">Wine</Label>
        <Input id="name" name="name" placeholder="Ch. Léoville-Barton" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vintage">Vintage</Label>
        <Input id="vintage" name="vintage" placeholder="2016" className="w-24" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <select
          id="source"
          name="source"
          defaultValue="cellar"
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          <option value="cellar">Club cellar</option>
          <option value="restaurant">Restaurant list</option>
        </select>
      </div>
      <div className="space-y-2 flex-1 min-w-48">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Drinking window, style…" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add wine"}
      </Button>
      <div className="basis-full">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
