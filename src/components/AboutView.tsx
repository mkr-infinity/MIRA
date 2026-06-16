import { useEffect, useState, useMemo } from "react";
import { useStore } from "../store";
import changelogRaw from "../../CHANGELOG.md?raw";
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
  GitBranch,
  ChevronDown,
  Database,
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

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = Math.max(1, Math.floor(value / 30));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(start);
      }
    }, duration / (value / step));
    return () => clearInterval(interval);
  }, [value]);
  return <>{display}{suffix}</>;
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

  const stars = repo?.stargazers_count ?? 0;
  const forks = repo?.forks_count ?? 0;
  const openIssues = repo?.open_issues_count ?? 0;

  return (
    <div className="space-y-5">
      {/* Terminal-style header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-mira border mira-border overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-2 mira-elevated border-b mira-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-mono mira-muted ml-2">about — zsh</span>
        </div>
        <div className="p-4 mira-surface/50 font-mono text-xs leading-relaxed">
          <div className="text-emerald-400/70">
            <span className="text-cyan-400">mkr-infinity</span>
            <span className="mira-muted">@</span>
            <span className="text-cyan-400">MIRA</span>
            <span className="mira-muted"> ~ % </span>
            <span className="mira-text">cat about.md</span>
          </div>
          <div className="mt-2 space-y-1">
            <div>
              <span className="text-cyan-400/60">name:</span>
              <span className="mira-text ml-2">MIRA</span>
            </div>
            <div>
              <span className="text-cyan-400/60">full_name:</span>
              <span className="mira-text ml-2">MKR Intelligent Responsive Assistant</span>
            </div>
            <div>
              <span className="text-cyan-400/60">type:</span>
              <span className="text-emerald-400/80 ml-2">Open-source AI desktop assistant</span>
            </div>
            <div>
              <span className="text-cyan-400/60">stack:</span>
              <span className="mira-text ml-2">Tauri 2 + React 18 + Rust</span>
            </div>
            <div>
              <span className="text-cyan-400/60">repo:</span>
              <a href={REPO} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline ml-2 inline-flex items-center gap-1">
                mkr-infinity/MIRA <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3">
        <DeveloperCard profile={profile} loading={loading} stars={stars} forks={forks} issues={openIssues} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ActionPills />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SupportCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <PrivacyCard />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SocialGrid />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <TechCard />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 text-[10px] font-mono mira-muted justify-center"
      >
        <Heart size={10} className="text-red-400 fill-red-400" />
        <span>Made with love by </span>
        <a href="https://github.com/mkr-infinity" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
          MKR-Infinity
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <VersionChangelog version={settings.version || "2.0.0"} />
      </motion.div>
    </div>
  );
}

function DeveloperCard({ profile, loading, stars, forks, issues }: { profile: GhProfile | null; loading: boolean; stars: number; forks: number; issues: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-mira border mira-border mira-elevated hover:scale-[1.01] transition-transform"
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="relative p-5">
        <div className="flex items-start gap-4">
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
              @{profile?.login || "mkr-infinity"}
            </p>
            {profile?.bio && (
              <p className="text-sm mira-text mt-2">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
      {profile && (
        <div className="border-t mira-border grid grid-cols-3 divide-x divide-[color:var(--border)]">
          {[
            { label: "followers", value: profile.followers, icon: null },
            { label: "following", value: profile.following, icon: null },
            { label: "repos", value: profile.public_repos, icon: null },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <div className="text-lg font-semibold font-mono mira-text tabular-nums">
                {loading ? "—" : <AnimatedCounter value={s.value} />}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider mira-muted">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Repo stats row */}
      <div className="border-t mira-border flex items-center justify-around px-4 py-2.5 text-[11px] font-mono mira-muted">
        <span className="flex items-center gap-1">
          <Star size={11} className="text-amber-400" />
          {loading ? "—" : <AnimatedCounter value={stars} />}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch size={11} className="text-cyan-400" />
          {loading ? "—" : forks}
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle size={11} className="text-green-400" />
          {loading ? "—" : issues} open
        </span>
      </div>
    </motion.div>
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
              className={`p-3 rounded-mira border mira-border mira-elevated flex items-center gap-3 transition-all hover:scale-[1.02] ${l.color}`}
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
  const techs = [
    { name: "Tauri 2", desc: "Native shell" },
    { name: "React 18", desc: "UI framework" },
    { name: "Rust", desc: "Backend" },
    { name: "Tailwind", desc: "Styling" },
    { name: "Framer Motion", desc: "Animation" },
    { name: "Zustand", desc: "State" },
    { name: "Web Speech", desc: "Voice" },
    { name: "Lucide", desc: "Icons" },
  ];
  return (
    <div className="rounded-mira border mira-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 mira-elevated border-b mira-border">
        <Database size={12} className="mira-accent" />
        <span className="text-[10px] font-mono uppercase tracking-wider mira-muted">
          Dependencies
        </span>
      </div>
      <div className="p-4 mira-surface/30 font-mono text-xs leading-relaxed">
        <div className="mira-muted mb-2">$ npm list --depth=0 --json</div>
        <div className="space-y-0.5">
          {techs.map((t) => (
            <div key={t.name} className="flex items-center">
              <span className="text-cyan-400/60">├─</span>
              <span className="mira-text ml-2">{t.name}</span>
              <span className="mira-muted ml-2">→ {t.desc}</span>
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-cyan-400/60">└─</span>
            <span className="text-emerald-400/70 ml-2">❤️ MKR-Infinity</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseChangelog(raw: string): Array<{ version: string; date: string; items: string[] }> {
  const entries: Array<{ version: string; date: string; items: string[] }> = [];
  const versionRegex = /^##\s+([\d.]+(?:x)?)\s*\(([^)]*)\)\s*$/gm;
  const itemRegex = /^[-*]\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  const sections = raw.split(/(?=^##\s)/m);
  for (const section of sections) {
    const vm = versionRegex.exec(section);
    if (!vm) continue;
    const version = vm[1];
    const date = vm[2];
    const items: string[] = [];
    let im: RegExpExecArray | null;
    while ((im = itemRegex.exec(section)) !== null) {
      const text = im[1].trim();
      if (text.length > 0) items.push(text);
    }
    if (items.length > 0) entries.push({ version, date, items });
  }
  return entries.slice(0, 10);
}

function VersionChangelog({ version }: { version: string }) {
  const [open, setOpen] = useState(false);
  const entries = useMemo(() => parseChangelog(changelogRaw), []);
  const latest = entries[0];
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
          {latest && (
            <span className="px-2 py-0.5 rounded-pill text-[10px] font-mono uppercase tracking-wider mira-accent-soft mira-accent border" style={{ borderColor: "var(--accent)" }}>
              v{latest.version}
            </span>
          )}
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
            <div className="p-4 space-y-5 max-h-[50vh] overflow-y-auto">
              {entries.length === 0 ? (
                <div className="text-xs mira-muted">No changelog entries found.</div>
              ) : (
                entries.map((rel, i) => (
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
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
