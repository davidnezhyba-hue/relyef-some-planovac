"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DesignerRow } from "@/types/database";
import { Plus, Trash2, Pencil, Check, X, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface EditableRowProps {
  designer: DesignerRow;
  onSave: (id: string, data: { name: string; email: string | null; phone: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function EditableRow({ designer, onSave, onDelete }: EditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(designer.name);
  const [email, setEmail] = useState(designer.email ?? "");
  const [phone, setPhone] = useState(designer.phone ?? "");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) nameRef.current?.focus();
  }, [editing]);

  function cancelEdit() {
    setName(designer.name);
    setEmail(designer.email ?? "");
    setPhone(designer.phone ?? "");
    setEditing(false);
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSave(designer.id, {
      name: trimmed,
      email: email.trim() || null,
      phone: phone.trim() || null,
    });
    setEditing(false);
  }

  return (
    <div className="py-3 border-b border-border last:border-0 group">
      {editing ? (
        <div className="space-y-2">
          <Input
            ref={nameRef}
            placeholder="Jméno *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancelEdit();
            }}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Telefon"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={save}
              disabled={!name.trim()}
              className="bg-[#633122] hover:bg-[#633122]/80 text-white"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Uložit
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5 mr-1" />
              Zrušit
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{designer.name}</p>
            {designer.email && (
              <a
                href={`mailto:${designer.email}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#633122] mt-0.5"
              >
                <Mail className="h-3 w-3 shrink-0" />
                {designer.email}
              </a>
            )}
            {designer.phone && (
              <a
                href={`tel:${designer.phone}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#633122] mt-0.5"
              >
                <Phone className="h-3 w-3 shrink-0" />
                {designer.phone}
              </a>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Smazat grafičku</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete smazat grafičku <strong>„{designer.name}"</strong>?
                    Tato akce odebere přiřazení grafičky ze všech videí.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Zrušit</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(designer.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Smazat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}

export function DesignersManagement() {
  const [designers, setDesigners] = useState<DesignerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);

  const supabase = createClient();

  async function fetchDesigners() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("designers")
      .select("*")
      .order("name");
    if (error) setError(error.message);
    else setDesigners(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDesigners();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("designers")
      .insert({
        name: trimmed,
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
      })
      .select()
      .single();
    if (!error && data) {
      setDesigners((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name, "cs"))
      );
      setNewName("");
      setNewEmail("");
      setNewPhone("");
    }
    setAdding(false);
  }

  async function handleUpdate(
    id: string,
    data: { name: string; email: string | null; phone: string | null }
  ) {
    const { error } = await supabase
      .from("designers")
      .update(data)
      .eq("id", id);
    if (!error) {
      setDesigners((prev) =>
        prev
          .map((d) => (d.id === id ? { ...d, ...data } : d))
          .sort((a, b) => a.name.localeCompare(b.name, "cs"))
      );
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("designers").delete().eq("id", id);
    if (!error) {
      setDesigners((prev) => prev.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="max-w-xl">
      {/* Add new designer */}
      <div className="rounded-lg border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Přidat grafičku</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <Label htmlFor="new-name" className="text-xs text-muted-foreground mb-1 block">
              Jméno *
            </Label>
            <Input
              id="new-name"
              placeholder="Jméno grafičky"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="new-email" className="text-xs text-muted-foreground mb-1 block">
                Email
              </Label>
              <Input
                id="new-email"
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-phone" className="text-xs text-muted-foreground mb-1 block">
                Telefon
              </Label>
              <Input
                id="new-phone"
                type="tel"
                placeholder="+420 xxx xxx xxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!newName.trim() || adding}
            className="w-full bg-[#633122] hover:bg-[#633122]/80 text-white gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {adding ? "Přidávám…" : "Přidat grafičku"}
          </Button>
        </form>
      </div>

      {/* List */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">
          Grafičky
          {designers.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({designers.length})
            </span>
          )}
        </h2>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Načítání…</p>
        ) : error ? (
          <div className="py-4">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchDesigners}>
              Zkusit znovu
            </Button>
          </div>
        ) : designers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Zatím žádné grafičky. Přidejte první výše.
          </p>
        ) : (
          <div>
            {designers.map((d) => (
              <EditableRow
                key={d.id}
                designer={d}
                onSave={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
