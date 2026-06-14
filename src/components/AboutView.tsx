import { useEffect, useState } from "react";
import { useStore } from "../store";
import {
  Github,
  Coffee,
  Instagram,
  Send,
  Globe2,
  Star,
  AlertCircle,
  Sparkles,
  Bug,
  Heart,
  ExternalLink,
  Shield,
  Cpu,
  Folder,
  Download,
  GitBranch,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MiraLogo } from "./MiraLogo";

const REPO = "https://github.com/mkr-infinity/MIRA";

interface GhProfile {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location?: string;
  company?: string;
}

interface GhRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  subscribers_count: number;
  description: string;
  default_branch: string;
  html_url: string;
}

export function AboutView() {
  const { settings } = useStore();
  const [profile, setProfile] = useState<GhProfile | null>(null);
  const [repo, setRepo] = useState<GhRepo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("https://api.github.com/users/mkr-infinity")
        .then((r) => r.json())
        .catch(() => null),
      fetch("https://api.github.com/repos/mkr-infinity/MIRA")
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([p, r]) => {
      if (p && p.login) setProfile(p);
      if (r && r.html_url) setRepo(r);
      setLoading(false);
    });
  }, []);

  const star = repo?.stargazers_count ?? 0;
  const forks = repo?.forks_count ?? 0;
  const issues = repo?.open_issues_count ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">
          About MIRA
        </h2>
        <p className="text-sm mira-muted">
          <span className="font-mono">MIRA</span> ={" "}
          <span className="font-mono">MKR Intelligent Responsive Assistant</span>.
          An open-source personal AI desktop assistant, built with care.
        </p>
      </div>

      {/* Developer card */}
      <DeveloperCard profile={profile} loading={loading} />

      {/* Repository card */}
      <RepoCard
        repo={repo}
        star={star}
        forks={forks}
        issues={issues}
        loading={loading}
      />

      {/* Action pills */}
      <ActionPills />

      {/* Support card */}
      <SupportCard />

      {/* Social grid */}
      <SocialGrid />

      {/* Privacy card */}
      <PrivacyCard />

      {/* Tech stack */}
      <TechCard />

      {/* Version + Changelog — pinned to the end */}
      <VersionChangelog version={settings.version || "2.0.0"} />
    </div>
  );
}

function DeveloperCard({ profile, loading }: { profile: GhProfile | null; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-5 rounded-mira border mira-border mira-elevated"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="relative flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-500/30 flex-shrink-0 shadow-glow-sm">
          {loading ? (
            <div className="w-full h-full mira-elevated animate-pulse" />
          ) : profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.login}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
              {(profile?.name || "M").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-semibold mira-text">
              {profile?.name || "Mohammad Kaif Raja"}
            </h3>
            <a
              href={profile?.html_url || "https://github.com/mkr-infinity"}
              target="_blank"
              rel="noreferrer"
              className="mira-muted hover:text-cyan-400"
            >
              <Github size={14} />
            </a>
          </div>
          <p className="text-sm mira-muted mt-0.5">
            @{profile?.login || "mkr-infinity"} · MKR-Infinity
          </p>
          {profile?.bio && (
            <p className="text-sm mira-text mt-2">{profile.bio}</p>
          )}
          {profile && (
            <div className="flex gap-3 mt-3 text-xs font-mono mira-muted">
              <span><b className="mira-text">{profile.followers}</b> followers</span>
              <span><b className="mira-text">{profile.following}</b> following</span>
              <span><b className="mira-text">{profile.public_repos}</b> repos</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RepoCard({ repo, star, forks, issues, loading }: { repo: GhRepo | null; star: number; forks: number; issues: number; loading: boolean }) {
  return (
    <div className="p-5 rounded-mira border mira-border mira-elevated">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Github size={16} className="text-cyan-400 flex-shrink-0" />
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-sm mira-text hover:text-cyan-400 truncate"
          >
            mkr-infinity/MIRA
          </a>
          <ExternalLink size={11} className="mira-muted flex-shrink-0" />
        </div>
      </div>
      <p className="text-sm mira-muted mb-4">
        {repo?.description || "MIRA — MKR Intelligent Responsive Assistant. Your personal AI desktop assistant. Voice, memory, projects, and full desktop automation."}
      </p>
      <div className="flex items-center gap-4 text-xs font-mono mira-muted">
        <span className="flex items-center gap-1.5">
          <Star size={12} className="text-amber-400" />
          <span className="mira-text font-medium">{loading ? "—" : star}</span> stars
        </span>
        <span className="flex items-center gap-1.5">
          <GitBranch size={12} className="text-cyan-400" />
          <span className="mira-text font-medium">{loading ? "—" : forks}</span> forks
        </span>
        <span className="flex items-center gap-1.5">
          <AlertCircle size={12} className="text-green-400" />
          <span className="mira-text font-medium">{loading ? "—" : issues}</span> issues
        </span>
        {repo?.default_branch && (
          <span className="ml-auto mira-muted">main</span>
        )}
      </div>
    </div>
  );
}

function ActionPills() {
  const { settings } = useStore();
  const repo = settings.repoUrl || REPO;
  const pills: Array<{ icon: any; label: string; href: string; color: string }> = [
    { icon: Star, label: "Star the repo", href: `${repo}`, color: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300 hover:border-amber-400/60" },
    { icon: Sparkles, label: "Request a feature", href: `${repo}/issues/new?labels=enhancement&template=feature_request.md`, color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60" },
    { icon: Bug, label: "Report an issue", href: `${repo}/issues/new?labels=bug&template=bug_report.md`, color: "from-red-500/20 to-red-500/5 border-red-500/30 text-red-300 hover:border-red-400/60" },
  ];
  return (
    <div>
      <h3 className="text-[10px] font-mono uppercase tracking-wider mira-muted mb-2">
        Contribute
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {pills.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-pill border bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-glow-sm ${p.color}`}
            >
              <Icon size={15} />
              <span className="text-sm font-medium">{p.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SupportCard() {
  return (
    <div className="p-5 rounded-mira border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-mira bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
          <Coffee size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold mira-text">
            Support development
          </h3>
          <p className="text-sm mira-muted mt-1">
            MIRA is open-source and free. If it makes your day a little easier,
            consider buying the developer a coffee.
          </p>
          <a
            href="https://buymeacoffee.com/mkr_infinity"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-pill bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            <Coffee size={14} />
            Buy me a coffee
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

function SocialGrid() {
  const links: Array<{ icon: any; label: string; handle: string; href: string; color: string }> = [
    { icon: Github, label: "GitHub", handle: "@mkr-infinity", href: "https://github.com/mkr-infinity/", color: "hover:border-mira-muted" },
    { icon: Instagram, label: "Instagram", handle: "@mkr_infinity", href: "https://www.instagram.com/mkr_infinity", color: "hover:border-pink-500/60" },
    { icon: Send, label: "Telegram", handle: "@mkr_infinity", href: "https://t.me/mkr_infinity", color: "hover:border-blue-500/60" },
    { icon: Globe2, label: "Portfolio", handle: "mkr-infinity.github.io", href: "https://mkr-infinity.github.io/", color: "hover:border-cyan-500/60" },
  ];
  return (
    <div>
      <h3 className="text-[10px] font-mono uppercase tracking-wider mira-muted mb-2">
        Connect
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={`p-3 rounded-mira border mira-border mira-elevated flex items-center gap-3 transition-colors ${l.color}`}
            >
              <Icon size={16} className="mira-muted" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium mira-text">{l.label}</div>
                <div className="text-[10px] font-mono mira-muted truncate">{l.handle}</div>
              </div>
              <ExternalLink size={11} className="mira-muted flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function PrivacyCard() {
  return (
    <div className="p-5 rounded-mira border border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-mira bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
          <Shield size={18} />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold mira-text">Your data stays yours</h3>
          <ul className="text-sm mira-muted mt-2 space-y-1">
            <li>· All conversations, memory, and skills stored on this device</li>
            <li>· API keys never leave your machine except to reach the provider</li>
            <li>· No telemetry, no analytics, no third-party trackers</li>
            <li>· Delete <span className="font-mono mira-text">~/Desktop/MIRA</span> to reset everything</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TechCard() {
  return (
    <div className="p-4 rounded-mira border mira-border mira-elevated">
      <h3 className="text-[10px] font-mono uppercase tracking-wider mira-muted mb-3">
        Built with
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[
          { name: "Tauri 2", desc: "Native shell" },
          { name: "React 18", desc: "UI framework" },
          { name: "Rust", desc: "Backend" },
          { name: "Tailwind", desc: "Styling" },
          { name: "Framer Motion", desc: "Animation" },
          { name: "Zustand", desc: "State" },
          { name: "Web Speech", desc: "Voice" },
          { name: "Lucide", desc: "Icons" },
        ].map((t) => (
          <div key={t.name} className="p-2 rounded-md mira-elevated">
            <div className="mira-text font-medium">{t.name}</div>
            <div className="text-[10px] mira-muted font-mono">{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="text-center text-[10px] font-mono mira-muted mt-4 flex items-center justify-center gap-1">
        Made with <Heart size={10} className="text-red-400 fill-red-400" /> by MKR-Infinity
      </div>
    </div>
  );
}

const CHANGELOG: Array<{ version: string; date: string; items: string[] }> = [
  {
    version: "2.0.0",
    date: "Jun 2026",
    items: [
      "Full rebrand: JARVIS → MIRA (MKR Intelligent Responsive Assistant).",
      "ChatGPT-style sidebar: project list, project-scoped chats, quick 'back to all chats' exit.",
      "ChatView top bar rebrand with local machine info (OS, hostname, time, accent stripe).",
      "Fixed duplicate sound buttons — consolidated into one clear voice toggle.",
      "Improved Data tab: total prompts, total context, total completion, median latency, storage size, beautiful stat cards with sparklines, per-provider breakdown.",
      "Improved Skills tab: search, category filters, inline edit drawer, quick add.",
      "Custom wake word field in Voice settings with test button.",
      "Custom personality / system prompt: presets (Concise, Friendly, Code Mentor, Therapist, Custom) + free textarea.",
      "Settings → General → Restart onboarding button for the 4-step wizard.",
      "Provider list cleaned — GitHub Copilot removed; Ollama setup only shows real /api/tags detections.",
      "Always-visible ChatGPT-style sidebar show/hide button (chevron).",
    ],
  },
  {
    version: "1.x",
    date: "Earlier",
    items: [
      "Voice mode with full-screen orb, push-to-talk and F11 hotkey.",
      "Desktop control: open apps, URLs, set volume, lock, notify.",
      "Memory, skills, projects and conversations stored under ~/Desktop/MIRA/.",
      "5 default providers and curated local model list.",
    ],
  },
];

function VersionChangelog({ version }: { version: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mira-elevated rounded-mira border mira-border overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:mira-hover transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="mira-accent" />
          <span className="text-sm font-medium">Changelog</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-pill text-[10px] font-mono uppercase tracking-wider mira-accent-soft mira-accent border"
            style={{ borderColor: "var(--accent)" }}
          >
            v{version}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mira-muted"
          >
            <ChevronDown size={14} />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="changelog"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t mira-border"
          >
            <div className="p-4 space-y-5">
              {CHANGELOG.map((rel, i) => (
                <div key={rel.version}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-pill text-[10px] font-mono uppercase tracking-wider border ${
                        i === 0 ? "mira-accent-soft mira-accent" : "mira-elevated mira-muted"
                      }`}
                      style={i === 0 ? { borderColor: "var(--accent)" } : undefined}
                    >
                      v{rel.version}
                    </span>
                    <span className="text-[10px] font-mono mira-muted">{rel.date}</span>
                  </div>
                  <ul className="text-xs mira-muted space-y-1.5 list-disc pl-5">
                    {rel.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
