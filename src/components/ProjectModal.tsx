import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Folder, Briefcase, Code, Book, Heart, Lightbulb, Music, Plane, Star, Zap, Brain, Sparkles, type LucideIcon } from "lucide-react";
import { useStore } from "../store";
import type { Project, ProjectMemoryScope } from "../types";

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  // When set, modal edits this project. When null, modal creates a new one.
  editingId: string | null;
  // Preset "active project" so the user can pick from existing or create a new chat in it
  asNewChat?: boolean;
}

const COLORS = [
  "#00D4FF",
];

const ICONS: { id: string; Icon: LucideIcon; label: string }[] = [
  { id: "folder", Icon: Folder, label: "Folder" },
  { id: "briefcase", Icon: Briefcase, label: "Work" },
  { id: "code", Icon: Code, label: "Code" },
  { id: "book", Icon: Book, label: "Study" },
  { id: "heart", Icon: Heart, label: "Personal" },
  { id: "lightbulb", Icon: Lightbulb, label: "Ideas" },
  { id: "music", Icon: Music, label: "Music" },
  { id: "plane", Icon: Plane, label: "Travel" },
  { id: "star", Icon: Star, label: "Starred" },
  { id: "zap", Icon: Zap, label: "Quick" },
];

const SCOPES: { id: ProjectMemoryScope; label: string; description: string }[] = [
  { id: "project", label: "Project memory", description: "Remembers facts scoped to this project only." },
  { id: "all", label: "Shared with global", description: "Also feeds the main memory store (cross-project)." },
  { id: "none", label: "No memory", description: "Ephemeral — nothing is written or read from memory." },
];

export function ProjectModal({ open, onClose, editingId, asNewChat }: ProjectModalProps) {
  const projects = useStore((s) => s.projects);
  const createProject = useStore((s) => s.createProject);
  const updateProject = useStore((s) => s.updateProject);
  const startNewChat = useStore((s) => s.newConversation);

  const editing = editingId ? projects.find((p) => p.id === editingId) : null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(COLORS[0]);
  const [icon, setIcon] = useState<string>("folder");
  const [memoryScope, setMemoryScope] = useState<ProjectMemoryScope>("project");
  const [customInstructions, setCustomInstructions] = useState("");
  const [pinned, setPinned] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Hydrate fields whenever the modal opens
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name || "");
      setDescription(editing.description || "");
      setColor(editing.color || COLORS[0]);
      setIcon(editing.icon || "folder");
      setMemoryScope(editing.memoryScope || "project");
      setCustomInstructions(editing.customInstructions || "");
      setPinned(!!editing.pinned);
    } else {
      setName("");
      setDescription("");
      setColor(COLORS[0]);
      setIcon("folder");
      setMemoryScope("project");
      setCustomInstructions("");
      setPinned(false);
    }
    const t = setTimeout(() => {
      nameRef.current?.focus();
      nameRef.current?.select();
    }, 60);
    return () => clearTimeout(t);
  }, [open, editing]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }
    if (editing) {
      await updateProject(editing.id, {
        name: trimmed,
        description: description.trim(),
        color,
        icon,
        memoryScope,
        customInstructions: customInstructions.trim(),
        pinned,
      });
    } else {
      const id = createProject({
        name: trimmed,
        description: description.trim(),
        color,
        icon,
        memoryScope,
        customInstructions: customInstructions.trim(),
        pinned,
      });
      if (asNewChat) {
        startNewChat(id);
      }
    }
    onClose();
  };

  const onStartChat = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }
    let id = editing?.id;
    if (!id) {
      id = createProject({
        name: trimmed,
        description: description.trim(),
        color,
        icon,
        memoryScope,
        customInstructions: customInstructions.trim(),
        pinned,
      });
    } else {
      await updateProject(id, {
        name: trimmed,
        description: description.trim(),
        color,
        icon,
        memoryScope,
        customInstructions: customInstructions.trim(),
        pinned,
      });
    }
    startNewChat(id);
    onClose();
  };

  const ActiveIcon = ICONS.find((i) => i.id === icon)?.Icon || Folder;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto mira-elevated mira-text rounded-2xl border mira-border shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 mira-elevated border-b mira-border">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-mira flex items-center justify-center flex-shrink-0"
                  style={{ background: color + "22", color }}
                >
                  <ActiveIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold mira-text truncate">
                    {editing ? "Edit project" : "New project"}
                  </h2>
                  <p className="text-[11px] mira-muted">
                    Projects scope files, memory, and instructions.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-mira mira-muted hover:mira-text mira-hover"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mira-muted">Name</label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Side-project research"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) onSave();
                  }}
                  className="mira-input mt-1.5"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mira-muted">Description <span className="opacity-60 normal-case tracking-normal">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={2}
                  className="mira-input mt-1.5 resize-none"
                  maxLength={240}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mira-muted">Color</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        background: c,
                        borderColor: color === c ? "var(--text)" : "transparent",
                        boxShadow: color === c ? "0 0 0 2px var(--bg)" : "none",
                      }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mira-muted">Icon</label>
                <div className="mt-1.5 grid grid-cols-5 gap-2">
                  {ICONS.map(({ id, Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setIcon(id)}
                      className={`p-2 rounded-mira border mira-border flex flex-col items-center gap-1 text-[10px] mira-muted hover:mira-text ${icon === id ? "mira-elevated mira-text" : "mira-hover"}`}
                      title={label}
                    >
                      <Icon size={16} />
                      <span className="truncate w-full text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mira-muted">Memory scope</label>
                <div className="mt-1.5 space-y-1.5">
                  {SCOPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setMemoryScope(s.id)}
                      className={`w-full text-left p-2.5 rounded-mira border mira-border flex items-start gap-2.5 ${memoryScope === s.id ? "mira-elevated" : "hover:mira-hover"}`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 flex-shrink-0"
                        style={{
                          borderColor: memoryScope === s.id ? color : "var(--border)",
                          background: memoryScope === s.id ? color : "transparent",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium mira-text">{s.label}</div>
                        <div className="text-[11px] mira-muted">{s.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mira-muted">
                  Custom instructions <span className="opacity-60 normal-case tracking-normal">(project-only system prompt)</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Always answer in Python, prefer the requests library, never use type hints…"
                  rows={4}
                  className="mira-input mt-1.5 resize-none font-mono text-[12px]"
                  maxLength={2000}
                />
                <div className="mt-1 text-[10px] mira-muted text-right">
                  {customInstructions.length}/2000
                </div>
              </div>

              <label className="flex items-center justify-between p-2.5 rounded-mira border mira-border mira-hover cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="mira-accent" />
                  <div>
                    <div className="text-xs font-medium mira-text">Pin to top of sidebar</div>
                    <div className="text-[10px] mira-muted">Pinned projects always appear first.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
              </label>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-2 px-6 py-4 mira-elevated border-t mira-border">
              <div className="text-[10px] mira-muted flex items-center gap-1">
                <Brain size={11} /> v2.1
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs rounded-mira mira-muted hover:mira-text mira-hover"
                >
                  Cancel
                </button>
                {editing ? (
                  <button
                    onClick={onStartChat}
                    className="px-3 py-1.5 text-xs rounded-mira mira-elevated mira-text border mira-border hover:mira-hover"
                  >
                    Open new chat here
                  </button>
                ) : (
                  <button
                    onClick={onStartChat}
                    className="px-3 py-1.5 text-xs rounded-mira mira-elevated mira-text border mira-border hover:mira-hover"
                  >
                    Create & chat
                  </button>
                )}
                <button
                  onClick={onSave}
                  className="px-3 py-1.5 text-xs rounded-mira mira-accent-bg text-white font-medium hover:opacity-90"
                >
                  {editing ? "Save" : "Create project"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
