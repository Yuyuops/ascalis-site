-- ============================================================
-- ASCALIS — Migration 004 : Fiche 8D, Plan de contrôle, Fournisseurs
-- ============================================================

-- ─── FICHE 8D ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.issues_8d (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  reference       text,
  title           text NOT NULL,
  source          text,
  process_id      uuid REFERENCES public.processes(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'in_progress', 'closed')),
  -- D1
  d1_team         text,
  -- D2
  d2_description  text,
  d2_detected_at  date,
  d2_scope        text,
  -- D3
  d3_containment  text,
  d3_done_at      date,
  -- D4
  d4_root_causes  text,
  d4_method       text,
  -- D5
  d5_actions      text,
  d5_planned_at   date,
  -- D6
  d6_validation   text,
  d6_done_at      date,
  -- D7
  d7_prevention   text,
  -- D8
  d8_closure      text,
  d8_closed_at    date,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issues_8d ENABLE ROW LEVEL SECURITY;
CREATE POLICY "8d_all" ON public.issues_8d
  FOR ALL USING (public.is_workspace_member(workspace_id));

CREATE TRIGGER trg_8d_updated_at
  BEFORE UPDATE ON public.issues_8d
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── PLAN DE CONTRÔLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.control_plans (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  process_id      uuid REFERENCES public.processes(id) ON DELETE SET NULL,
  characteristic  text NOT NULL,
  control_method  text,
  frequency       text,
  responsible     text,
  specification   text,
  reaction_plan   text,
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'closed')),
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.control_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_all" ON public.control_plans
  FOR ALL USING (public.is_workspace_member(workspace_id));

CREATE TRIGGER trg_cp_updated_at
  BEFORE UPDATE ON public.control_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── FOURNISSEURS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id     uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name             text NOT NULL,
  category         text,
  contact          text,
  qualification    text NOT NULL DEFAULT 'pending'
                   CHECK (qualification IN ('pending', 'qualified', 'conditional', 'disqualified')),
  quality_score    int CHECK (quality_score BETWEEN 0 AND 100),
  delay_score      int CHECK (delay_score BETWEEN 0 AND 100),
  cost_score       int CHECK (cost_score BETWEEN 0 AND 100),
  last_audit_date  date,
  next_audit_date  date,
  notes            text,
  created_by       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sup_all" ON public.suppliers
  FOR ALL USING (public.is_workspace_member(workspace_id));

CREATE TRIGGER trg_sup_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
