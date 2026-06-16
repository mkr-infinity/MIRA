import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Folder,
  FolderOpen,
  Bot,
  Volume2,
  Settings,
  Sun,
  Moon,
  Info,
  X,
  Edit3,
  Check,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cx, THEMES, type ThemeId } from "../lib/theme";
import { ProjectModal } from "./ProjectModal";
import { MiraLogo } from "./MiraLogo";

const PROJECT_COLORS = ["#00D4FF", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#C2410C", "#84CC16", "#A855F7", "#F43F5E"];

interface Props {
  onOpenSettings: (tab?: string) => void;
  onOpenVoiceMode: () => void;
  voiceMode: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function timeBucket(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diff = now.getTime() - ts;
  if (diff < 7 * 86400_000) return "Previous 7 days";
  if (diff < 30 * 86400_000) return "Previous 30 days";
  return "Older";
}

export function Sidebar({
  onOpenSettings,
  onOpenVoiceMode,
  voiceMode,
  collapsed,
  onToggleCollapse,
}: Props) {
  const {
    conversations,
    activeId,
    newConversation,
    setActive,
    deleteConversation,
    settings,
    projects,
    activeProjectId,
    setActiveProject,
    setTheme,
    createProject,
    deleteProject,
  } = useStore();

  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuForProjectId, setMenuForProjectId] = useState<string | null>(null);
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    editingId: string | null;
    asNewChat: boolean;
  }>({ open: false, editingId: null, asNewChat: false });
  const menuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Close per-project menu on outside click
  useEffect(() => {
    if (!menuForProjectId) return;
    const handler = (e: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setMenuForProjectId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuForProjectId]);

  // Sort projects: pinned first, then by order
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return (a.order || 0) - (b.order || 0);
    });
  }, [projects]);

  const filteredConvs = useMemo(() => {
    const scoped = activeProjectId
      ? conversations.filter((c) => c.projectId === activeProjectId)
      : conversations;
    if (!query.trim()) return scoped;
    const q = query.toLowerCase();
    return scoped.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, activeProjectId, query]);

  const groups: Record<string, typeof conversations> = {};
  for (const c of filteredConvs) {
    (groups[timeBucket(c.updatedAt)] ||= []).push(c);
  }

  const activeProvider = settings.providers.find((p) => p.id === settings.activeProviderId);
  const userInitial = (settings.userName || "M").slice(0, 1).toUpperCase();
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const currentTheme = THEMES.find((t) => t.id === settings.theme) || THEMES[0];

  function handleNewChat() {
    // newConversation() reads activeProjectId from the store, so chats
    // created from a project view are scoped to that project. From the
    // "All chats" view they are unprojected — exactly like ChatGPT.
    newConversation();
  }

  const newChatLabel = activeProject ? `New chat in ${activeProject.name}` : "New chat";

  // Collapsed: show only the icon rail
  return (
    <aside
      className="h-full flex-shrink-0 flex flex-col border-r mira-border mira-surface transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 56 : 260 }}
    >
      {collapsed ? (
        <>
          <div className="h-14 flex items-center justify-center border-b mira-border">
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 flex items-center justify-center rounded-lg mira-elevated hover:mira-hover transition-colors"
              title="Open sidebar"
            >
              <PanelLeftOpen size={16} className="mira-accent" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center py-3 gap-1.5">
            <button
              onClick={handleNewChat}
              className="w-9 h-9 flex items-center justify-center rounded-lg mira-elevated hover:mira-hover transition-colors"
              title="New chat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onOpenVoiceMode}
              className={cx(
                "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                voiceMode ? "mira-elevated" : "mira-elevated hover:mira-hover"
              )}
              title="Voice mode (F11)"
            >
              <Volume2 size={16} />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => onOpenSettings("general")}
              className="w-9 h-9 flex items-center justify-center rounded-lg mira-elevated hover:mira-hover transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
      {/* Logo — glass header */}
      <div className="h-14 px-3 flex items-center gap-2.5 border-b mira-border">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-lg mira-elevated hover:mira-hover transition-colors"
          title="Hide sidebar (ChatGPT-style)"
        >
          <PanelLeftClose size={15} className="mira-accent" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <MiraLogo size={24} glow={true} animated={true} />
          <div className="font-display font-semibold tracking-wide gradient-text text-sm">
            MIRA
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] mira-muted hidden 2xl:block">
            Intelligent Assistant
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 flex items-center justify-center rounded-md mira-muted hover:mira-text transition-colors"
          title="Hide sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 mira-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats…"
            className="mira-input pl-8 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 mira-muted hover:mira-text p-1"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* New chat + Voice mode */}
      <div className="px-3 pt-3 space-y-1.5">
        <button
          onClick={handleNewChat}
          title={newChatLabel}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-mira border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--accent-faint)',
            borderColor: 'var(--accent-soft)',
            color: 'var(--text)',
          }}
        >
          <Plus size={16} className="mira-accent" />
          <span className="text-sm font-medium truncate">{newChatLabel}</span>
        </button>
        <button
          onClick={onOpenVoiceMode}
          className={cx(
            "w-full flex items-center gap-2 px-3 py-2 rounded-mira border transition-all",
            voiceMode
              ? "mira-elevated mira-text mira-border"
              : "mira-elevated mira-border mira-muted hover:mira-text"
          )}
        >
          <Volume2 size={15} />
          <span className="text-sm font-medium">Voice mode</span>
          <span className="ml-auto text-[9px] font-mono uppercase tracking-wider mira-muted">
            F11
          </span>
        </button>
      </div>

      {/* Projects — ChatGPT-style */}
      <div className="px-2 pt-3">
        {/* Header: collapse caret + label + new (+) */}
        <div className="flex items-center justify-between px-2 pb-1">
          <button
            onClick={() => setProjectsCollapsed((v) => !v)}
            className="flex items-center gap-1 mira-muted hover:mira-text transition-colors"
            title={projectsCollapsed ? "Expand" : "Collapse"}
          >
            <motion.span
              animate={{ rotate: projectsCollapsed ? -90 : 0 }}
              transition={{ duration: 0.15 }}
              className="inline-flex"
            >
              <ChevronRight size={11} />
            </motion.span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
              Projects
            </span>
          </button>
          <button
            onClick={() =>
              setProjectModal({ open: true, editingId: null, asNewChat: false })
            }
            className="mira-muted hover:mira-text p-1 -m-1 rounded"
            title="New project"
          >
            <Plus size={13} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!projectsCollapsed && (
            <motion.div
              key="proj-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {/* "All chats" is its own row, not part of the project list */}
              <button
                onClick={() => setActiveProject(null)}
                className={cx(
                  "w-full mt-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors",
                  !activeProjectId
                    ? "mira-elevated mira-text"
                    : "mira-muted hover:mira-hover"
                )}
              >
                <Bot size={13} />
                <span>All chats</span>
                <span className="ml-auto text-[10px] font-mono mira-muted">
                  {conversations.filter((c) => !c.projectId).length}
                </span>
              </button>

              {/* Project rows */}
              <div className="space-y-0.5 mt-0.5">
                {sortedProjects.length === 0 && (
                  <button
                    onClick={() =>
                      setProjectModal({ open: true, editingId: null, asNewChat: false })
                    }
                    className="w-full px-2.5 py-3 text-[11px] mira-muted italic text-center rounded-mira hover:mira-hover border border-dashed mira-border"
                  >
                    + Create your first project
                  </button>
                )}
                {sortedProjects.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    active={activeProjectId === p.id}
                    count={conversations.filter((c) => c.projectId === p.id).length}
                    menuOpen={menuForProjectId === p.id}
                    onActivate={() => setActiveProject(p.id)}
                    onOpenMenu={(e) => {
                      e.stopPropagation();
                      setMenuForProjectId(menuForProjectId === p.id ? null : p.id);
                    }}
                    onCloseMenu={() => setMenuForProjectId(null)}
                    menuRef={projectMenuRef}
                    onRename={() => {
                      setProjectModal({ open: true, editingId: p.id, asNewChat: false });
                      setMenuForProjectId(null);
                    }}
                    onDelete={() => {
                      const count = conversations.filter((c) => c.projectId === p.id).length;
                      const msg = count > 0
                        ? `Delete "${p.name}" and move its ${count} chat(s) to All chats?`
                        : `Delete "${p.name}"?`;
                      if (confirm(msg)) {
                        deleteProject(p.id);
                        if (activeProjectId === p.id) setActiveProject(null);
                      }
                      setMenuForProjectId(null);
                    }}
                  />
                ))}
                {/* Bottom: small "New project" button — ChatGPT style */}
                {sortedProjects.length > 0 && (
                  <button
                    onClick={() =>
                      setProjectModal({ open: true, editingId: null, asNewChat: false })
                    }
                    className="w-full mt-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] mira-muted hover:mira-hover hover:mira-text transition-colors"
                  >
                    <Plus size={11} />
                    <span>New project</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recents */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        {Object.keys(groups).length === 0 && (
          <div className="text-center text-xs mira-muted px-3 py-6">
            {query
              ? "No matches"
              : activeProjectId
              ? "No chats in this project yet"
              : "No conversations yet"}
          </div>
        )}
        {activeProject && (
          <div className="px-3 py-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider mira-muted">
            <Folder size={11} style={{ color: activeProject.color }} />
            {activeProject.name}
          </div>
        )}
        {Object.entries(groups).map(([bucket, items]) => (
          <div key={bucket}>
            <div className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] mira-muted">
              {bucket}
            </div>
            <div className="space-y-0.5">
              {items.map((c) => (
                <div
                  key={c.id}
                  className={cx(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    c.id === activeId
                      ? "mira-elevated mira-text"
                      : "mira-muted hover:mira-hover"
                  )}
                  onClick={() => setActive(c.id)}
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 mira-danger"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User pill — click to open menu */}
      <div className="relative" ref={menuRef}>
        {userMenuOpen && (
          <div className="absolute bottom-[68px] left-3 right-3 mira-elevated border mira-border rounded-mira shadow-pop p-1 z-30 animate-fade-in">
            <button
              onClick={() => {
                const idx = THEMES.findIndex((t) => t.id === settings.theme);
                const next = THEMES[(idx + 1) % THEMES.length].id;
                setTheme(next);
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg mira-muted hover:mira-hover mira-text text-sm"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/20"
                style={{ background: currentTheme.accent }}
              />
              <span>{currentTheme.name} theme</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings("about");
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg mira-muted hover:mira-hover mira-text text-sm"
            >
              <Info size={14} />
              <span>About</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings("general");
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg mira-muted hover:mira-hover mira-text text-sm"
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            <div className="my-1 border-t mira-border" />
            <div className="px-3 py-2 text-[10px] mira-muted">
              Signed in as <span className="mira-text">{settings.userName || "User"}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="w-full p-3 border-t mira-border flex items-center gap-2.5 hover:mira-hover transition-colors text-left"
        >
          {settings.avatar ? (
            <img
              src={settings.avatar}
              alt={settings.userName || "User"}
              className="w-8 h-8 rounded-full border mira-border object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full mira-elevated border mira-border flex items-center justify-center mira-text text-sm font-semibold flex-shrink-0"
              style={
                settings.accentColor
                  ? { background: `${settings.accentColor}25`, color: settings.accentColor, borderColor: `${settings.accentColor}60` }
                  : undefined
              }
            >
              {userInitial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mira-text truncate">
              {settings.userName || "User"}
            </div>
            <div className="text-[10px] mira-muted truncate font-mono">
              {activeProvider?.name || "No provider"}
            </div>
          </div>
        </button>
      </div>

      {/* Project modal — add/edit/rename projects */}
      <ProjectModal
        open={projectModal.open}
        onClose={() => setProjectModal({ open: false, editingId: null, asNewChat: false })}
        editingId={projectModal.editingId}
        asNewChat={projectModal.asNewChat}
      />
        </>
      )}
    </aside>
  );
}

function ProjectRow({
  project,
  active,
  count,
  menuOpen,
  onActivate,
  onOpenMenu,
  onCloseMenu,
  menuRef,
  onRename,
  onDelete,
}: {
  project: any;
  active: boolean;
  count: number;
  menuOpen: boolean;
  onActivate: () => void;
  onOpenMenu: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cx(
        "group/proj relative flex items-center gap-1 rounded-lg transition-colors",
        active
          ? "mira-elevated mira-text"
          : "mira-muted hover:mira-hover"
      )}
    >
      <button
        onClick={onActivate}
        className="flex-1 flex items-center gap-2 px-2.5 py-1.5 text-sm min-w-0"
      >
        {active ? (
          <FolderOpen size={13} style={{ color: project.color }} />
        ) : (
          <Folder size={13} style={{ color: project.color }} />
        )}
        <span className="truncate flex-1 text-left">{project.name}</span>
        <span className="text-[10px] font-mono mira-muted">{count}</span>
      </button>
      <button
        onClick={onOpenMenu}
        className={cx(
          "p-1.5 transition-opacity",
          menuOpen
            ? "opacity-100 mira-text"
            : "opacity-0 group-hover/proj:opacity-100"
        )}
        title="Project actions"
      >
        <MoreHorizontal size={12} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-1 top-full mt-1 z-30 w-36 mira-elevated border mira-border rounded-mira shadow-pop p-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename();
                onCloseMenu();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm mira-muted hover:mira-hover mira-text transition-colors"
            >
              <Edit3 size={12} />
              <span>Rename</span>
            </button>
            <div className="my-1 border-t mira-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                onCloseMenu();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm hover:bg-red-500/10 transition-colors"
              style={{ color: "var(--danger)" }}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
