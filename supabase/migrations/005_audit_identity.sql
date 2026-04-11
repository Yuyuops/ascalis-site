-- ============================================================
-- ASCALIS — Migration 005 : Audits + Fiches identité processus
-- ============================================================

-- ─── AUDITS ──────────────────────────────────────────────────
-- Partagé par grille-audit (type='grille') et diagnostic-terrain (type='diagnostic')
-- Les critères sont stockés en JSONB : [{id, criterion, constat, score, max_score}]
CREATE TABLE IF NOT EXISTS public.audits (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  audit_type      text NOT NULL DEFAULT 'grille'
                  CHECK (audit_type IN ('grille', 'diagnostic')),
  title           text NOT NULL,
  audited_scope   text,
  process_id      uuid REFERENCES public.processes(id) ON DELETE SET NULL,
  auditor_name    text,
  audit_date      date,
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'in_progress', 'completed')),
  global_score    numeric,           -- % calculé côté client, sauvegardé ici
  conclusion      text,
  criteria        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audits_all" ON public.audits
  FOR ALL USING (public.is_workspace_member(workspace_id));

CREATE TRIGGER trg_audits_updated_at
  BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── FICHES IDENTITÉ PROCESSUS ───────────────────────────────
-- Une fiche par processus (contrainte UNIQUE sur process_id)
CREATE TABLE IF NOT EXISTS public.process_identities (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  process_id       uuid NOT NULL UNIQUE REFERENCES public.processes(id) ON DELETE CASCADE,
  purpose          text,      -- Finalité / objectif
  inputs           text,      -- Entrées
  outputs          text,      -- Sorties / livrables
  stakeholders     text,      -- Parties prenantes
  risks            text,      -- Risques associés
  key_steps        text,      -- Étapes clés
  kpi_list         text,      -- KPIs associés
  resources        text,      -- Ressources
  documents        text,      -- Documents associés
  improvement_axes text,      -- Axes d'amélioration
  created_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.process_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pi_all" ON public.process_identities
  FOR ALL USING (public.is_workspace_member(workspace_id));

CREATE TRIGGER trg_pi_updated_at
  BEFORE UPDATE ON public.process_identities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
