"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VenueForm } from "./venue-form";

/** "Add venue" button → dialog wrapping the candidate VenueForm. */
export function AddVenueDialog({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PlusIcon />
            Add venue
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a candidate venue</DialogTitle>
          <DialogDescription>
            New venues start as candidates in the pipeline.
          </DialogDescription>
        </DialogHeader>
        <VenueForm slug={slug} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
