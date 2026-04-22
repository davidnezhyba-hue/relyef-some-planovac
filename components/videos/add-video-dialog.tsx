"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { title: string; date_assigned: string | null }) => Promise<void>;
}

export function AddVideoDialog({ open, onClose, onAdd }: AddVideoDialogProps) {
  const [title, setTitle] = useState("");
  const [dateAssigned, setDateAssigned] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onAdd({
      title: title.trim(),
      date_assigned: dateAssigned || null,
    });
    setTitle("");
    setDateAssigned("");
    setSubmitting(false);
  }

  function handleClose() {
    setTitle("");
    setDateAssigned("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Přidat nové video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Název videa *</Label>
            <Input
              id="title"
              placeholder="Název videa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Datum zadání</Label>
            <Input
              id="date"
              type="date"
              value={dateAssigned}
              onChange={(e) => setDateAssigned(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Zrušit
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || submitting}
              className="bg-[#633122] hover:bg-[#633122]/80 text-white"
            >
              {submitting ? "Přidávám…" : "Přidat video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
