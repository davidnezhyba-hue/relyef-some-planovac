"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DesignerRow } from "@/types/database";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
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

function EditableRow({
  designer,
  onSave,
  onDelete,
}: {
  designer: DesignerRow;
  onSave: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(designer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  async function save() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== designer.name) {
      await onSave(designer.id, trimmed);
    } else {
      setValue(designer.name);
    }
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 group">
      <div className="flex-1">
        {editing ? (
          <input
            ref={inputRef}
            className="w-full text-sm border border-input rounded px-2 py-1 outline-none focus:ring-2 focus:ring-ring"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setValue(designer.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span className="text-sm font-medium">{designer.name}</span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {editing ? (
          <>
            <button
              onClick={save}
              className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setValue(designer.name);
                setEditing(false);
              }}
              className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
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
  );
}

export function DesignersManagement() {
  const [designers, setDesigners] = useState<DesignerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
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
      .insert({ name: trimmed })
      .select()
      .single();
    if (!error && data) {
      setDesigners((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, "cs")));
      setNewName("");
    }
    setAdding(false);
  }

  async function handleUpdate(id: string, name: string) {
    const { error } = await supabase
      .from("designers")
      .update({ name })
      .eq("id", id);
    if (!error) {
      setDesigners((prev) =>
        prev
          .map((d) => (d.id === id ? { ...d, name } : d))
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
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Jméno grafičky"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newName.trim() || adding}
            className="bg-[#633122] hover:bg-[#633122]/80 text-white gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Přidat
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
