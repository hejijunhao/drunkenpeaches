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

/** "Propose a venue" button → dialog wrapping the candidate VenueForm. */
export function AddVenueDialog({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            Propose a venue
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Propose a venue</DialogTitle>
          <DialogDescription>
            New houses start as candidates. The committee tastes before it books.
          </DialogDescription>
        </DialogHeader>
        <VenueForm slug={slug} onSuccess={() => setOpen(false)} compact />
      </DialogContent>
    </Dialog>
  );
}
