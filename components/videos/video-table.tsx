"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VideoRow, DesignerRow, ProductionStatus, ApprovalStatus, Database } from "@/types/database";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import {
  Folder,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  X,
  Send,
  Facebook,
  Instagram,
  Youtube,
  Link2,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddVideoDialog } from "@/components/videos/add-video-dialog";
import { VideoCommentsModal } from "@/components/videos/video-comments-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.16 8.16 0 004.77 1.52V7.01a4.85 4.85 0 01-1-.32z" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "d. M. yyyy", { locale: cs });
  } catch {
    return dateStr;
  }
}

interface TagInputProps {
  tags: string[];
  onSave: (tags: string[]) => void;
}

function TagInput({ tags, onSave }: TagInputProps) {
  const [localTags, setLocalTags] = useState(tags);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  function addTag() {
    const trimmed = inputValue.trim();
    if (trimmed && !localTags.includes(trimmed)) {
      const newTags = [...localTags, trimmed];
      setLocalTags(newTags);
      onSave(newTags);
    }
    setInputValue("");
  }

  function removeTag(tag: string) {
    const newTags = localTags.filter((t) => t !== tag);
    setLocalTags(newTags);
    onSave(newTags);
  }

  return (
    <div className="flex flex-wrap items-center gap-1 min-w-[140px]">
      {localTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-0.5 rounded-full bg-[#D8C2AA]/50 text-[#633122] text-xs px-2 py-0.5"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:opacity-70 ml-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        className="text-xs border-0 outline-none bg-transparent w-20 placeholder:text-muted-foreground focus:ring-1 focus:ring-ring rounded px-1"
        placeholder="+ tag"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
      />
    </div>
  );
}

interface SocialCellProps {
  url: string | null;
  icon: React.ReactNode;
  platform: string;
  onSave: (url: string | null) => void;
}

function SocialCell({ url, icon, platform, onSave }: SocialCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(url ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(url ?? "");
  }, [url]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function save() {
    const trimmed = value.trim() || null;
    onSave(trimmed);
    setEditing(false);
  }

  if (url && !editing) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-[#633122] hover:text-[#633122]/70 transition-colors"
          >
            {icon}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>Otevřít {platform}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-28 text-xs border border-input rounded px-1.5 py-1 outline-none focus:ring-2 focus:ring-ring"
        placeholder="https://..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setValue(url ?? "");
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted transition-colors"
      title={`Přidat odkaz na ${platform}`}
    >
      <Plus className="h-3 w-3" />
    </button>
  );
}

interface InlineTitleProps {
  value: string;
  onSave: (value: string) => void;
}

function InlineTitle({ value, onSave }: InlineTitleProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function save() {
    const trimmed = localValue.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setLocalValue(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-full text-sm border border-input rounded px-2 py-1 outline-none focus:ring-2 focus:ring-ring"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setLocalValue(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-left text-sm font-medium text-foreground hover:text-[#633122] hover:underline truncate max-w-[220px] block"
      title={value}
    >
      {value}
    </button>
  );
}

interface VideoRowComponentProps {
  video: VideoRow;
  designers: DesignerRow[];
  onUpdate: (id: string, field: keyof VideoRow, value: unknown) => void;
  onDelete: (id: string) => void;
  commentCount: number;
  onOpenComments: (id: string) => void;
}

function VideoTableRow({ video, designers, onUpdate, onDelete, commentCount, onOpenComments }: VideoRowComponentProps) {
  const [pendingDesigner, setPendingDesigner] = useState<DesignerRow | null>(null);
  const [emailComment, setEmailComment] = useState("");

  function cycleProductionStatus() {
    const next: ProductionStatus =
      video.production_status === "in_progress" ? "done" : "in_progress";
    onUpdate(video.id, "production_status", next);
  }

  function cycleApprovalStatus() {
    const order: ApprovalStatus[] = ["pending", "approved", "rejected"];
    const idx = order.indexOf(video.approval_status);
    const next = order[(idx + 1) % order.length];
    onUpdate(video.id, "approval_status", next);
  }

  function sendForApproval() {
    const commentsUrl = `https://relyef-some-planovac.vercel.app/video/${video.id}/comments`;
    const subject = encodeURIComponent(`Schválení videa: ${video.title}`);
    const body = encodeURIComponent(
      [
        `Dobrý den,`,
        ``,
        `žádáme vás o schválení videa: ${video.title}`,
        video.finished_video_folder_url
          ? `\nOdkaz na hotové video: ${video.finished_video_folder_url}`
          : ``,
        ``,
        `Své připomínky nebo schválení prosím zapište zde: ${commentsUrl}`,
        ``,
        `Děkuji`,
      ]
        .join("\n")
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    onUpdate(video.id, "approval_status", "pending");
    onUpdate(video.id, "approval_sent_at", new Date().toISOString());
  }

  function handleDesignerSelect(designerId: string) {
    if (!designerId) {
      onUpdate(video.id, "designer_id", null);
      onUpdate(video.id, "assigned_to_designer", false);
      return;
    }
    const designer = designers.find((d) => d.id === designerId);
    if (!designer) return;
    setPendingDesigner(designer);
    setEmailComment("");
  }

  function applyDesignerAssignment(designer: DesignerRow) {
    onUpdate(video.id, "designer_id", designer.id);
    onUpdate(video.id, "assigned_to_designer", true);
    setPendingDesigner(null);
    setEmailComment("");
  }

  function handleSendEmail(designer: DesignerRow) {
    const subject = encodeURIComponent(`Podklady k videu: ${video.title}`);
    const body = encodeURIComponent(
      [
        `Dobrý den,`,
        ``,
        `zasílám podklady k videu: ${video.title}`,
        video.materials_url ? `Odkaz na podklady: ${video.materials_url}` : ``,
        emailComment ? `\nKomentář: ${emailComment}` : ``,
        ``,
        `Děkuji`,
      ]
        .filter((l) => l !== undefined)
        .join("\n")
    );
    const to = encodeURIComponent(designer.email ?? "");
    window.open(`mailto:${to}?subject=${subject}&body=${body}`);
    applyDesignerAssignment(designer);
  }

  const showSendButton =
    video.production_status === "done" && !!video.finished_video_folder_url;

  return (
    <>
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      {/* Název videa */}
      <td className="px-3 py-2.5 min-w-[200px] max-w-[260px]">
        <InlineTitle
          value={video.title}
          onSave={(v) => onUpdate(video.id, "title", v)}
        />
      </td>

      {/* Datum zadání */}
      <td className="px-3 py-2.5 min-w-[140px]">
        <input
          type="date"
          className="text-sm bg-transparent border-0 outline-none focus:ring-2 focus:ring-ring rounded px-1 py-0.5 w-full cursor-pointer"
          value={video.date_assigned ?? ""}
          onChange={(e) =>
            onUpdate(video.id, "date_assigned", e.target.value || null)
          }
          title={video.date_assigned ? formatDate(video.date_assigned) : "Nastavit datum"}
        />
      </td>

      {/* Podklady — odkaz na složku s podklady */}
      <td className="px-3 py-2.5 min-w-[90px] text-center">
        {video.materials_url ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={video.materials_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[#633122] hover:text-[#633122]/70 transition-colors"
              >
                <Folder className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Otevřít podklady</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <FolderUrlInput
            value={video.materials_url}
            onSave={(v) => onUpdate(video.id, "materials_url", v)}
          />
        )}
      </td>

      {/* Grafička — před "Zadáno grafičce" */}
      <td className="px-3 py-2.5 min-w-[140px]">
        <select
          className="text-sm bg-transparent border border-input rounded px-2 py-1 outline-none focus:ring-2 focus:ring-ring w-full"
          value={video.designer_id ?? ""}
          onChange={(e) => handleDesignerSelect(e.target.value)}
        >
          <option value="">— nevybráno —</option>
          {designers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </td>

      {/* Zadáno grafičce — za "Grafička" */}
      <td className="px-3 py-2.5 min-w-[120px] text-center">
        <button
          onClick={() =>
            onUpdate(video.id, "assigned_to_designer", !video.assigned_to_designer)
          }
        >
          <Badge
            variant={video.assigned_to_designer ? "success" : "muted"}
            className="cursor-pointer select-none whitespace-nowrap"
          >
            {video.assigned_to_designer ? "✓ Zadáno" : "✗ Nezadáno"}
          </Badge>
        </button>
      </td>

      {/* Stav výroby */}
      <td className="px-3 py-2.5 min-w-[120px] text-center">
        <button onClick={cycleProductionStatus}>
          <Badge
            variant={
              video.production_status === "done" ? "success" : "warning"
            }
            className="cursor-pointer select-none whitespace-nowrap"
          >
            {video.production_status === "done" ? "Hotové" : "V přípravě"}
          </Badge>
        </button>
      </td>

      {/* Složka videa */}
      <td className="px-3 py-2.5 min-w-[160px]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            {video.finished_video_folder_url ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={video.finished_video_folder_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#633122] hover:text-[#633122]/70 transition-colors"
                  >
                    <Folder className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Otevřít složku</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <FolderUrlInput
                value={video.finished_video_folder_url}
                onSave={(v) => onUpdate(video.id, "finished_video_folder_url", v)}
              />
            )}
          </div>
          {showSendButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={sendForApproval}
                  className="flex items-center gap-1 text-xs text-white bg-[#633122] hover:bg-[#633122]/80 rounded px-2 py-0.5 transition-colors whitespace-nowrap"
                >
                  <Send className="h-3 w-3" />
                  Ke schválení
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Odeslat ke schválení</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>

      {/* Schválení */}
      <td className="px-3 py-2.5 min-w-[110px] text-center">
        <button onClick={cycleApprovalStatus}>
          <Badge
            variant={
              video.approval_status === "approved"
                ? "success"
                : video.approval_status === "rejected"
                ? "error"
                : "muted"
            }
            className="cursor-pointer select-none whitespace-nowrap"
          >
            {video.approval_status === "approved"
              ? "Schváleno"
              : video.approval_status === "rejected"
              ? "Zamítnuto"
              : "Čeká"}
          </Badge>
        </button>
      </td>

      {/* FB */}
      <td className="px-3 py-2.5 min-w-[60px] text-center">
        <SocialCell
          url={video.published_fb}
          icon={<Facebook className="h-4 w-4" />}
          platform="Facebook"
          onSave={(v) => onUpdate(video.id, "published_fb", v)}
        />
      </td>

      {/* IG */}
      <td className="px-3 py-2.5 min-w-[60px] text-center">
        <SocialCell
          url={video.published_ig}
          icon={<Instagram className="h-4 w-4" />}
          platform="Instagram"
          onSave={(v) => onUpdate(video.id, "published_ig", v)}
        />
      </td>

      {/* YT */}
      <td className="px-3 py-2.5 min-w-[60px] text-center">
        <SocialCell
          url={video.published_yt}
          icon={<Youtube className="h-4 w-4" />}
          platform="YouTube"
          onSave={(v) => onUpdate(video.id, "published_yt", v)}
        />
      </td>

      {/* TikTok */}
      <td className="px-3 py-2.5 min-w-[60px] text-center">
        <SocialCell
          url={video.published_tiktok}
          icon={<TikTokIcon />}
          platform="TikTok"
          onSave={(v) => onUpdate(video.id, "published_tiktok", v)}
        />
      </td>

      {/* Pinterest */}
      <td className="px-3 py-2.5 min-w-[60px] text-center">
        <SocialCell
          url={video.published_pinterest}
          icon={<PinterestIcon />}
          platform="Pinterest"
          onSave={(v) => onUpdate(video.id, "published_pinterest", v)}
        />
      </td>

      {/* Výsledky */}
      <td className="px-3 py-2.5 min-w-[80px] text-center">
        <SocialCell
          url={video.results_url}
          icon={<Link2 className="h-4 w-4" />}
          platform="Výsledky"
          onSave={(v) => onUpdate(video.id, "results_url", v)}
        />
      </td>

      {/* Tagy */}
      <td className="px-3 py-2.5 min-w-[160px]">
        <TagInput
          tags={video.tags}
          onSave={(tags) => onUpdate(video.id, "tags", tags)}
        />
      </td>

      {/* Komentáře */}
      <td className="px-3 py-2.5 min-w-[60px] text-center">
        <button
          onClick={() => onOpenComments(video.id)}
          className="relative inline-flex items-center justify-center text-muted-foreground hover:text-[#633122] transition-colors p-1"
          title="Zobrazit komentáře"
        >
          <MessageCircle className="h-4 w-4" />
          {commentCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 rounded-full bg-[#633122] text-white text-[9px] font-semibold flex items-center justify-center px-1 leading-none">
              {commentCount}
            </span>
          )}
        </button>
      </td>

      {/* Smazat */}
      <td className="px-3 py-2.5 min-w-[50px] text-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Smazat video</AlertDialogTitle>
              <AlertDialogDescription>
                Opravdu chcete smazat video <strong>„{video.title}"</strong>?
                Tuto akci nelze vrátit zpět.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Zrušit</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(video.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Smazat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>

    {/* Email modal — otevře se při výběru grafičky */}
    <Dialog
      open={!!pendingDesigner}
      onOpenChange={(open) => {
        if (!open) {
          setPendingDesigner(null);
          setEmailComment("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Odeslat podklady grafičce</DialogTitle>
          {pendingDesigner && (
            <DialogDescription>
              Grafička: <strong>{pendingDesigner.name}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        {pendingDesigner && (
          <div className="space-y-4">
            {/* Email grafičky */}
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Email: </span>
              {pendingDesigner.email ? (
                <a
                  href={`mailto:${pendingDesigner.email}`}
                  className="text-[#633122] font-medium"
                >
                  {pendingDesigner.email}
                </a>
              ) : (
                <span className="text-muted-foreground italic">
                  Grafička nemá vyplněný email
                </span>
              )}
            </div>

            {/* Odkaz na podklady */}
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Podklady: </span>
              {video.materials_url ? (
                <a
                  href={video.materials_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#633122] font-medium underline underline-offset-2 break-all"
                >
                  {video.materials_url}
                </a>
              ) : (
                <span className="text-amber-600 font-medium">
                  ⚠ Video nemá vyplněné podklady
                </span>
              )}
            </div>

            {/* Komentář */}
            <div className="space-y-1.5">
              <Label htmlFor="email-comment" className="text-sm">
                Komentář{" "}
                <span className="text-muted-foreground font-normal">(volitelný)</span>
              </Label>
              <Textarea
                id="email-comment"
                placeholder="Napište zprávu pro grafičku…"
                value={emailComment}
                onChange={(e) => setEmailComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => pendingDesigner && applyDesignerAssignment(pendingDesigner)}
          >
            Přeskočit
          </Button>
          <Button
            onClick={() => pendingDesigner && handleSendEmail(pendingDesigner)}
            disabled={!pendingDesigner?.email}
            className="bg-[#633122] hover:bg-[#633122]/80 text-white gap-1.5"
          >
            <Send className="h-4 w-4" />
            Odeslat email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function FolderUrlInput({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function save() {
    onSave(localValue.trim() || null);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-32 text-xs border border-input rounded px-1.5 py-1 outline-none focus:ring-2 focus:ring-ring"
        placeholder="https://drive..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setLocalValue(value ?? "");
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded px-1.5 py-1 transition-colors"
      title="Přidat odkaz na složku"
    >
      <Folder className="h-3.5 w-3.5" />
      <span>Přidat</span>
    </button>
  );
}

export function VideoTable() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [designers, setDesigners] = useState<DesignerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [productionFilter, setProductionFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [metricFilter, setMetricFilter] = useState<"overdue" | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openCommentsVideoId, setOpenCommentsVideoId] = useState<string | null>(null);

  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current) {
    try {
      supabaseRef.current = createClient();
      console.log("[VideoTable] Supabase client inicializován, URL:",
        process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + "…");
    } catch (err) {
      console.error("[VideoTable] Nelze inicializovat Supabase client:", err);
    }
  }
  const supabase = supabaseRef.current;

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setError("Supabase client není dostupný. Zkontrolujte .env.local soubor.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    console.log("[VideoTable] Načítám data z Supabase…");
    const [videosResult, designersResult, commentsResult] = await Promise.all([
      supabase
        .from("videos")
        .select("*")
        .order("date_assigned", { ascending: false, nullsFirst: false }),
      supabase.from("designers").select("*").order("name"),
      supabase.from("video_comments").select("video_id"),
    ]);

    if (videosResult.error) {
      console.error("[VideoTable] Chyba při načítání videí:", {
        message: videosResult.error.message,
        code: videosResult.error.code,
        details: videosResult.error.details,
        hint: videosResult.error.hint,
      });
      setError("Nepodařilo se načíst videa: " + videosResult.error.message);
    } else {
      console.log("[VideoTable] Načteno videí:", videosResult.data?.length ?? 0);
      setVideos(videosResult.data ?? []);
    }
    if (designersResult.error) {
      console.error("[VideoTable] Chyba při načítání grafiček:", designersResult.error);
    } else {
      setDesigners(designersResult.data ?? []);
    }
    if (!commentsResult.error && commentsResult.data) {
      const counts: Record<string, number> = {};
      for (const row of commentsResult.data) {
        counts[row.video_id] = (counts[row.video_id] ?? 0) + 1;
      }
      setCommentCounts(counts);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpdate(id: string, field: keyof VideoRow, value: unknown) {
    if (!supabase) return;
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
    const { error } = await supabase
      .from("videos")
      .update({ [field]: value, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", id);
    if (error) {
      console.error("[VideoTable] Chyba při aktualizaci pole", field, ":", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      fetchData();
    }
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    setVideos((prev) => prev.filter((v) => v.id !== id));
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) {
      console.error("[VideoTable] Chyba při mazání videa:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      fetchData();
    }
  }

  async function handleAddVideo(data: {
    title: string;
    date_assigned: string | null;
    materials_url: string | null;
  }) {
    if (!supabase) {
      throw new Error("Supabase client není dostupný. Zkontrolujte .env.local soubor.");
    }

    console.log("[VideoTable] Přidávám video:", data);

    const insertPayload: Database["public"]["Tables"]["videos"]["Insert"] = {
      title: data.title,
      date_assigned: data.date_assigned ?? undefined,
      materials_url: data.materials_url ?? undefined,
    };

    console.log("[VideoTable] Insert payload:", insertPayload);

    const { data: newVideo, error } = await supabase
      .from("videos")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("[VideoTable] Chyba při insertu videa:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error),
      });
      throw new Error(error.message || "Neznámá chyba při ukládání videa");
    }

    console.log("[VideoTable] Video úspěšně přidáno:", newVideo);
    setVideos((prev) => [newVideo, ...prev]);
    setShowAddDialog(false);
  }

  const allTags = [...new Set(videos.flatMap((v) => v.tags))].sort();

  const overduecutoff = new Date();
  overduecutoff.setDate(overduecutoff.getDate() - 14);
  const isOverdue = (v: VideoRow) =>
    !!v.date_assigned &&
    new Date(v.date_assigned) < overduecutoff &&
    v.production_status !== "done";

  const metrics = {
    total: videos.length,
    inProgress: videos.filter((v) => v.production_status === "in_progress").length,
    pendingApproval: videos.filter((v) => v.approval_status === "pending").length,
    overdue: videos.filter(isOverdue).length,
  };

  const filteredVideos = videos.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = v.title.toLowerCase().includes(q);
      const matchesTags = v.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesTags) return false;
    }
    if (tagFilter.length > 0) {
      if (!tagFilter.some((t) => v.tags.includes(t))) return false;
    }
    if (productionFilter !== "all" && v.production_status !== productionFilter)
      return false;
    if (approvalFilter !== "all" && v.approval_status !== approvalFilter)
      return false;
    if (metricFilter === "overdue" && !isOverdue(v)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Metriky */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-border bg-background">
        {[
          {
            label: "Celkem videí",
            value: metrics.total,
            active: false,
            onClick: () => {
              setProductionFilter("all");
              setApprovalFilter("all");
              setMetricFilter(null);
              setSearchQuery("");
              setTagFilter([]);
            },
          },
          {
            label: "Ve výrobě",
            value: metrics.inProgress,
            active: productionFilter === "in_progress" && metricFilter === null,
            onClick: () => {
              setProductionFilter("in_progress");
              setApprovalFilter("all");
              setMetricFilter(null);
            },
          },
          {
            label: "Čeká na schválení",
            value: metrics.pendingApproval,
            active: approvalFilter === "pending" && metricFilter === null,
            onClick: () => {
              setApprovalFilter("pending");
              setProductionFilter("all");
              setMetricFilter(null);
            },
          },
          {
            label: "Po deadlinu",
            value: metrics.overdue,
            active: metricFilter === "overdue",
            onClick: () => {
              setMetricFilter(metricFilter === "overdue" ? null : "overdue");
              setProductionFilter("all");
              setApprovalFilter("all");
            },
          },
        ].map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors hover:bg-muted/60",
              card.active
                ? "border-[#633122] bg-[#D8C2AA]/30"
                : "border-border bg-card"
            )}
          >
            <p
              className={cn(
                "text-2xl font-bold",
                card.active ? "text-[#633122]" : "text-foreground"
              )}
            >
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-border bg-background">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Hledat podle názvu nebo tagu…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tag filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Tagy
              {tagFilter.length > 0 && (
                <span className="ml-1 rounded-full bg-[#633122] text-white text-xs px-1.5 py-0.5 leading-none">
                  {tagFilter.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
            <DropdownMenuLabel>Filtrovat podle tagu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allTags.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Žádné tagy
              </div>
            ) : (
              allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={tagFilter.includes(tag)}
                  onCheckedChange={(checked) => {
                    setTagFilter((prev) =>
                      checked ? [...prev, tag] : prev.filter((t) => t !== tag)
                    );
                  }}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))
            )}
            {tagFilter.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  className="w-full text-xs text-muted-foreground px-2 py-1.5 hover:bg-muted rounded text-left"
                  onClick={() => setTagFilter([])}
                >
                  Zrušit filtr
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Production status filter */}
        <select
          className="text-sm border border-input rounded-md px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring"
          value={productionFilter}
          onChange={(e) => setProductionFilter(e.target.value)}
        >
          <option value="all">Stav výroby: vše</option>
          <option value="in_progress">V přípravě</option>
          <option value="done">Hotové</option>
        </select>

        {/* Approval status filter */}
        <select
          className="text-sm border border-input rounded-md px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring"
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
        >
          <option value="all">Schválení: vše</option>
          <option value="pending">Čeká</option>
          <option value="approved">Schváleno</option>
          <option value="rejected">Zamítnuto</option>
        </select>

        <Button
          className="ml-auto bg-[#633122] hover:bg-[#633122]/80 text-white gap-1.5"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Přidat video
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Načítání…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Zkusit znovu
            </Button>
          </div>
        ) : (
          <div className="table-scroll-container overflow-x-auto h-full">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-muted/50 sticky top-0 z-10">
                  <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[200px]">
                    Název videa
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[140px]">
                    Datum zadání
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[90px]">
                    Podklady
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[140px]">
                    Grafička
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[120px]">
                    Zadáno grafičce
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[120px]">
                    Stav výroby
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[160px]">
                    Složka videa
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[110px]">
                    Schválení
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[60px]">
                    FB
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[60px]">
                    IG
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[60px]">
                    YT
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[60px]">
                    TikTok
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[60px]">
                    Pinterest
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[80px]">
                    Výsledky
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[160px]">
                    Tagy
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wide text-muted-foreground min-w-[60px]">
                    Komentáře
                  </th>
                  <th className="px-3 py-3 min-w-[50px]" />
                </tr>
              </thead>
              <tbody>
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={17}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      {videos.length === 0
                        ? "Zatím žádná videa. Přidejte první video kliknutím na tlačítko výše."
                        : "Žádná videa neodpovídají zvoleným filtrům."}
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((video) => (
                    <VideoTableRow
                      key={video.id}
                      video={video}
                      designers={designers}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      commentCount={commentCounts[video.id] ?? 0}
                      onOpenComments={setOpenCommentsVideoId}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddVideoDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddVideo}
      />

      {openCommentsVideoId && (
        <VideoCommentsModal
          open={!!openCommentsVideoId}
          onClose={() => setOpenCommentsVideoId(null)}
          videoId={openCommentsVideoId}
          videoTitle={videos.find((v) => v.id === openCommentsVideoId)?.title ?? ""}
          onCountChange={(id, count) =>
            setCommentCounts((prev) => ({ ...prev, [id]: count }))
          }
        />
      )}
    </div>
  );
}
