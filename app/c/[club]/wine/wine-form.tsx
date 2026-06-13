"use client";

import { useActionState, useRef, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import { createWineAction } from "@/app/actions/wine";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form-error";
import { useSuccessToast } from "@/lib/use-success-toast";

export function WineForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createWineAction.bind(null, slug),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useSuccessToast(pending, state.error, "Wine added to the catalogue");

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    if (pending) submitted.current = true;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-6">
      <div className="space-y-2 sm:col-span-3">
        <Label htmlFor="name">Wine</Label>
        <Input id="name" name="name" placeholder="Ch. Léoville-Barton" required />
      </div>
      <div className="space-y-2 sm:col-span-1">
        <Label htmlFor="vintage">Vintage</Label>
        <Input id="vintage" name="vintage" placeholder="2016" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="source">Source</Label>
        <Select name="source" defaultValue="cellar">
          <SelectTrigger id="source" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cellar">Club cellar</SelectItem>
            <SelectItem value="restaurant">Restaurant list</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-5">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Drinking window, style…" />
      </div>
      <div className="flex items-end sm:col-span-1">
        <Button type="submit" loading={pending} className="w-full">
          <PlusIcon />
          Add
        </Button>
      </div>
      <div className="sm:col-span-6">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
