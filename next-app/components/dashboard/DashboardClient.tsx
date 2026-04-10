"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Shield,
  Target,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";

import { AscalisLogo } from "@/components/AscalisLogo";
import { getCockpitSummary, getOverdueActions, getRedKpis, type CockpitSummary, type ActionAlert, type KpiAlert } from "@/lib/cockpit";
import { ImportWizard } from "@/components/dashboard/ImportWizard";
import { getCurrentUser, login, logout, type ProUser } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { withBasePath } from "@/lib/site-config";
import { toolRegistry, freeTools, proTools, type ToolDefinition } from "@/lib/tool-registry";
import type { ToolStage } from "@/lib/tool-registry";

// ─── Stage config ────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<ToolStage, { label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; bg: string }> = {
  probleme:   { label: "Problème",   Icon: Target,      color: "text-red-600",    bg: "bg-red-50" },
  diagnostic: { label: "Diagnostic", Icon: Search,      color: "text-blue-600",   bg: "bg-blue-50" },
  analyse:    { label: "Analyse",    Icon: BarChart2,   color: "text-violet-600", bg: "bg-violet-50" },
  decision:   { label: "Décision",   Icon: GitBranch,   color: "text-amber-600",  bg: "bg-amber-50" },
  action:     { label: "Action",     Icon: Zap,         color: "text-emerald-600",bg: "bg-emerald-50" },
  controle:   { label: "Contrôle",   Icon: Shield,      color: "text-sky-600",    bg: "bg-sky-50" },
  revue:      { label: "Revue",      Icon: RefreshCw,   color: "text-slate-600",  bg: "bg-slate-50" },
};

const STAGE_ORDER: ToolStage[] = ["probleme", "diagnostic", "analyse", "decision", "action", "controle", "revue"];

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (user: ProUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const user = await login(email, password);
    if (user) {
      onLogin(user);
    } else {
      setError("Identifiants incorrects.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0F1A2E] p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 text-center shadow-2xl">
        <div className="mb-8 flex justify-center">
          <AscalisLogo />
        </div>
        <h1 className="font-display text-2xl text-[#0F1A2E]">Espace Pro</h1>
        <p className="mt-2 text-sm text-slate-500">Accès réservé aux intervenants ASCALIS</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block font-heading text-xs font-medium uppercase tracking-widest text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#B07642] focus:ring-2 focus:ring-[#B07642]/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-heading text-xs font-medium uppercase tracking-widest text-slate-400">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#B07642] focus:ring-2 focus:ring-[#B07642]/20"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-[#0F1A2E] py-3 font-heading text-sm font-medium text-white transition hover:bg-[#1B3A4B] disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <Link href={withBasePath("/")} className="mt-6 inline-flex items-center gap-1 font-heading text-xs text-[#D4956A] hover:text-[#B07642]">
          <Home className="size-3" aria-hidden="true" />
          Retour au site
        </Link>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  user,
  activeStage,
  onStageClick,
  onLogout,
  onClose,
}: {
  user: ProUser;
  activeStage: ToolStage | "overview";
  onStageClick: (stage: ToolStage | "overview") => void;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <aside className="flex h-full w-[260px] flex-col bg-[#0F1A2E] text-white">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
        <AscalisLogo variant="light" />
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white lg:hidden" aria-label="Fermer le menu">
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#B07642] font-heading text-xs font-semibold text-white">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-white/40 capitalize">{user.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Navigation espace pro">
        <p className="px-6 pb-2 pt-2 font-heading text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">
          Navigation
        </p>

        <SidebarLink
          icon={LayoutGrid}
          label="Vue d'ensemble"
          active={activeStage === "overview"}
          onClick={() => onStageClick("overview")}
        />

        <p className="px-6 pb-2 pt-4 font-heading text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">
          Par étape
        </p>

        {STAGE_ORDER.map((stage) => {
          const { label, Icon } = STAGE_CONFIG[stage];
          const count = toolRegistry.filter((t) => t.stage === stage).length;
          return (
            <SidebarLink
              key={stage}
              icon={Icon}
              label={label}
              badge={count}
              active={activeStage === stage}
              onClick={() => onStageClick(stage)}
            />
          );
        })}

        <p className="px-6 pb-2 pt-4 font-heading text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">
          Liens
        </p>
        <a
          href={withBasePath("/")}
          className="flex min-h-[44px] w-full items-center gap-2.5 border-none bg-none px-6 py-2.5 text-left text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Home className="size-[18px] shrink-0 opacity-50" aria-hidden="true" />
          Site vitrine
        </a>
        <a
          href={withBasePath("/outils/")}
          className="flex min-h-[44px] w-full items-center gap-2.5 border-none bg-none px-6 py-2.5 text-left text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
        >
          <BookOpen className="size-[18px] shrink-0 opacity-50" aria-hidden="true" />
          Index des outils
        </a>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] px-6 py-4">
        <button
          onClick={onLogout}
          className="flex min-h-[44px] w-full items-center gap-2 text-sm text-white/35 transition hover:text-white"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  badge?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[44px] w-full items-center gap-2.5 border-r-2 px-6 py-2.5 text-left text-sm transition ${
        active
          ? "border-[#B07642] bg-white/[0.06] text-white"
          : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon className={`size-[18px] shrink-0 ${active ? "opacity-100" : "opacity-50"}`} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-heading text-[10px] text-white/60">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Stats cards ──────────────────────────────────────────────────────────────

// ─── Cockpit grid ─────────────────────────────────────────────────────────────

function CockpitGrid() {
  const [summary, setSummary] = useState<CockpitSummary | null>(null);
  const [overdueActions, setOverdueActions] = useState<ActionAlert[]>([]);
  const [redKpis, setRedKpis] = useState<KpiAlert[]>([]);

  useEffect(() => {
    getCockpitSummary().then(async (s) => {
      setSummary(s);
      if (s.workspaceId) {
        const [actions, kpis] = await Promise.all([
          getOverdueActions(s.workspaceId),
          getRedKpis(s.workspaceId),
        ]);
        setOverdueActions(actions);
        setRedKpis(kpis);
      }
    });
  }, []);

  if (!summary) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const maturity = summary.maturityScore;
  const maturityColor = maturity >= 80 ? "text-emerald-600" : maturity >= 60 ? "text-amber-600" : "text-red-600";
  const maturityBg   = maturity >= 80 ? "bg-emerald-50"   : maturity >= 60 ? "bg-amber-50"   : "bg-red-50";

  return (
    <div className="space-y-4">
      {/* Cartes KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Actions en retard */}
        <div className={`rounded-xl border p-5 ${summary.actionsOverdue > 0 ? "border-red-200 bg-red-50" : "border-slate-100 bg-white"}`}>
          <div className="flex items-center justify-between">
            <AlertTriangle className={`size-4 ${summary.actionsOverdue > 0 ? "text-red-500" : "text-slate-300"}`} aria-hidden="true" />
            {summary.actionsOverdue > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 font-heading text-[10px] text-white">RETARD</span>}
          </div>
          <p className={`mt-2 font-display text-3xl leading-none ${summary.actionsOverdue > 0 ? "text-red-600" : "text-[#0F1A2E]"}`}>{summary.actionsOverdue}</p>
          <p className="mt-1 text-xs text-slate-400">Actions en retard</p>
          <p className="mt-1 font-heading text-[10px] text-slate-300">{summary.actionsOpen} ouvertes au total</p>
        </div>

        {/* KPIs hors cible */}
        <div className={`rounded-xl border p-5 ${summary.kpisRed > 0 ? "border-red-200 bg-red-50" : summary.kpisOrange > 0 ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white"}`}>
          <div className="flex items-center justify-between">
            <BarChart2 className={`size-4 ${summary.kpisRed > 0 ? "text-red-500" : summary.kpisOrange > 0 ? "text-amber-500" : "text-slate-300"}`} aria-hidden="true" />
            {(summary.kpisRed > 0 || summary.kpisOrange > 0) && (
              <span className={`rounded-full px-1.5 py-0.5 font-heading text-[10px] text-white ${summary.kpisRed > 0 ? "bg-red-500" : "bg-amber-500"}`}>ALERTE</span>
            )}
          </div>
          <p className={`mt-2 font-display text-3xl leading-none ${summary.kpisRed > 0 ? "text-red-600" : summary.kpisOrange > 0 ? "text-amber-600" : "text-[#0F1A2E]"}`}>
            {summary.kpisRed + summary.kpisOrange}
          </p>
          <p className="mt-1 text-xs text-slate-400">KPIs hors cible</p>
          <p className="mt-1 font-heading text-[10px] text-slate-300">{summary.kpisTotal} indicateurs suivis</p>
        </div>

        {/* Revues à préparer */}
        <div className={`rounded-xl border p-5 ${summary.reviewsDue > 0 ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white"}`}>
          <div className="flex items-center justify-between">
            <Calendar className={`size-4 ${summary.reviewsDue > 0 ? "text-amber-500" : "text-slate-300"}`} aria-hidden="true" />
            {summary.reviewsDue > 0 && <span className="rounded-full bg-amber-500 px-1.5 py-0.5 font-heading text-[10px] text-white">À PRÉPARER</span>}
          </div>
          <p className={`mt-2 font-display text-3xl leading-none ${summary.reviewsDue > 0 ? "text-amber-600" : "text-[#0F1A2E]"}`}>{summary.reviewsDue}</p>
          <p className="mt-1 text-xs text-slate-400">Revues dans 30 jours</p>
        </div>

        {/* Score de maturité */}
        <div className={`rounded-xl border p-5 ${maturityBg} border-transparent`}>
          <div className="flex items-center justify-between">
            <TrendingUp className={`size-4 ${maturityColor}`} aria-hidden="true" />
            <span className={`rounded-full px-1.5 py-0.5 font-heading text-[10px] ${maturityBg} ${maturityColor}`}>MATURITÉ</span>
          </div>
          <p className={`mt-2 font-display text-3xl leading-none ${maturityColor}`}>{maturity}%</p>
          <p className="mt-1 text-xs text-slate-400">Score système qualité</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/60">
            <div className={`h-1.5 rounded-full transition-all ${maturity >= 80 ? "bg-emerald-500" : maturity >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${maturity}%` }} />
          </div>
        </div>
      </div>

      {/* Alertes détaillées */}
      {(overdueActions.length > 0 || redKpis.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {overdueActions.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-white p-5">
              <h4 className="mb-3 flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.1em] text-red-600">
                <AlertTriangle className="size-3.5" aria-hidden="true" /> Actions en retard
              </h4>
              <ul className="space-y-2">
                {overdueActions.map(a => (
                  <li key={a.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#0F1A2E]">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.process_name ?? "—"} · échéance {a.due_date}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 font-heading text-[9px] font-semibold uppercase ${a.priority === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{a.priority}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {redKpis.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-white p-5">
              <h4 className="mb-3 flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.1em] text-red-600">
                <BarChart2 className="size-3.5" aria-hidden="true" /> KPIs hors cible
              </h4>
              <ul className="space-y-2">
                {redKpis.map(k => (
                  <li key={k.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#0F1A2E]">{k.name}</p>
                      <p className="text-xs text-slate-400">{k.kpi_group ?? "—"} · {k.current_value ?? "—"}{k.unit ? ` ${k.unit}` : ""}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 font-heading text-[9px] font-semibold uppercase ${k.status === "red" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{k.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tool card ────────────────────────────────────────────────────────────────

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const stage = STAGE_CONFIG[tool.stage];
  const StageIcon = stage.Icon;
  return (
    <Link
      href={tool.route}
      className="group flex min-h-[44px] items-start gap-3 rounded-xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all hover:-translate-y-0.5 hover:border-[#B07642]/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B07642]"
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stage.bg}`}>
        <StageIcon className={`size-4 ${stage.color}`} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading text-sm font-medium text-[#0F1A2E] leading-snug">{tool.title}</h4>
          <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-300 transition group-hover:text-[#B07642]" aria-hidden="true" />
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{tool.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 font-heading text-[9px] font-semibold uppercase tracking-wider ${tool.visibility === "free" ? "bg-emerald-50 text-emerald-600" : "bg-[#B07642]/10 text-[#B07642]"}`}>
            {tool.visibility === "free" ? "Gratuit" : "Pro"}
          </span>
          <span className="font-heading text-[9px] uppercase tracking-wider text-slate-300">{stage.label}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Overview section ─────────────────────────────────────────────────────────

function OverviewSection({ user, cockpitKey }: { user: ProUser; cockpitKey: number }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-[#0F1A2E]">{greeting}, {user.name.split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-slate-400">Voici l'état de votre système qualité.</p>
      </div>
      <CockpitGrid key={cockpitKey} />
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">Tous les outils</h3>
          <span className="font-heading text-xs text-slate-300">{toolRegistry.length} outils</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {toolRegistry.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stage section ────────────────────────────────────────────────────────────

function StageSection({ stage }: { stage: ToolStage }) {
  const config = STAGE_CONFIG[stage];
  const StageIcon = config.Icon;
  const tools = toolRegistry.filter((t) => t.stage === stage);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${config.bg}`}>
          <StageIcon className={`size-5 ${config.color}`} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-3xl text-[#0F1A2E]">{config.label}</h2>
          <p className="text-sm text-slate-400">{tools.length} outil{tools.length > 1 ? "s" : ""} dans cette étape</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [user, setUser] = useState<ProUser | null>(null);
  const [ready, setReady] = useState(false);
  const [activeStage, setActiveStage] = useState<ToolStage | "overview">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [cockpitKey, setCockpitKey] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    getCurrentUser().then((u) => {
      setUser(u);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!session) setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleLogin(u: ProUser) {
    setUser(u);
  }

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  function handleStageClick(stage: ToolStage | "overview") {
    setActiveStage(stage);
    setSidebarOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) return null;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const topbarTitle =
    activeStage === "overview" ? "Vue d'ensemble" : STAGE_CONFIG[activeStage].label;

  return (
    <div className="flex h-dvh overflow-hidden bg-[#FAF9F6]">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (desktop fixed, mobile slide-in) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:relative lg:translate-x-0 lg:transition-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          user={user}
          activeStage={activeStage}
          onStageClick={handleStageClick}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <h1 className="font-heading text-base font-semibold text-[#0F1A2E]">{topbarTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#B07642] px-3 py-1.5 font-heading text-xs font-medium text-white transition hover:bg-[#8A5B30]"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              Importer
            </button>
            <a
              href={withBasePath("/")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-heading text-xs text-slate-500 transition hover:border-[#B07642]/40 hover:text-[#B07642]"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Site vitrine
            </a>
          </div>
        </header>

        {/* Import wizard */}
        {importOpen && (
          <ImportWizard
            onClose={() => setImportOpen(false)}
            onSuccess={() => { setImportOpen(false); setCockpitKey(k => k + 1); }}
          />
        )}

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeStage === "overview" ? (
            <OverviewSection user={user} cockpitKey={cockpitKey} />
          ) : (
            <StageSection stage={activeStage} />
          )}
        </main>
      </div>
    </div>
  );
}
