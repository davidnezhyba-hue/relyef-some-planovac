"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VideoCommentRow } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";

interface VideoCommentsModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  onCountChange: (videoId: string, count: number) => void;
}

export function VideoCommentsModal({
  open,
  onClose,
  videoId,
  videoTitle,
  onCountChange,
}: VideoCommentsModalProps) {
  const [comments, setComments] = useState<VideoCommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const rows = data ?? [];
        setComments(rows);
        onCountChange(videoId, rows.length);
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });
  }, [open, videoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("video_comments")
      .insert({ video_id: videoId, author_name: authorName.trim(), content: content.trim() })
      .select()
      .single();
    if (!error && data) {
      const updated = [...comments, data];
      setComments(updated);
      onCountChange(videoId, updated.length);
      setContent("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">
            Komentáře — <span className="font-normal text-muted-foreground">{videoTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2.5 py-1 min-h-0">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Načítání…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Zatím žádné komentáře. Přidejte první níže.
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-md border bg-muted/30 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(parseISO(c.created_at), "d. M. yyyy HH:mm", { locale: cs })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground">{c.content}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t pt-4 mt-1 shrink-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="cm-author" className="text-xs text-muted-foreground mb-1 block">
                Vaše jméno *
              </Label>
              <Input
                id="cm-author"
                placeholder="Jméno"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cm-content" className="text-xs text-muted-foreground mb-1 block">
                Komentář *
              </Label>
              <Textarea
                id="cm-content"
                placeholder="Napište komentář nebo připomínku…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={!authorName.trim() || !content.trim() || submitting}
              className="w-full bg-[#633122] hover:bg-[#633122]/80 text-white gap-1.5"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Odesílám…" : "Přidat komentář"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
