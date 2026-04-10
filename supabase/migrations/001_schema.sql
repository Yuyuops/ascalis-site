-- ============================================================
-- ASCALIS — Migration 001 : Schéma de base
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── WORKSPACES ──────────────────────────────────────────────
-- Un workspace = un client (ou ASCALIS lui-même)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── WORKSPACE MEMBERS ───────────────────────────────────────
-- Qui a accès à quel workspace, avec quel rôle
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- ─── PROCESSES ───────────────────────────────────────────────
-- Liste des processus pilotés (ex: PROC-001 Achats, PROC-002 Production)
CREATE TABLE IF NOT EXISTS public.processes (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  code         text NOT NULL,
  name         text NOT NULL,
  pilot_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, code)
);

-- ─── ACTIONS ─────────────────────────────────────────────────
-- Plan d'action central — toutes les actions issues des outils
CREATE TABLE IF NOT EXISTS public.actions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title           text NOT NULL,
  source          text,                          -- origine : audit, NC, revue...
  owner_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  process_id      uuid REFERENCES public.processes(id) ON DELETE SET NULL,
  expected_effect text,
  due_date        date,
  status          text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'in_progress', 'done', 'cancelled')),
  priority        text NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  progress        int NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes           text,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── KPIS ────────────────────────────────────────────────────
-- Tableau de bord qualité — indicateurs de pilotage
CREATE TABLE IF NOT EXISTS public.kpis (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name            text NOT NULL,
  kpi_group       text,                          -- ex: "Qualité", "Délai", "Coût"
  owner_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  period          text,                          -- ex: "2026-Q2"
  target_value    numeric,
  target_operator text DEFAULT '>='
                  CHECK (target_operator IN ('>=', '<=', '=')),
  current_value   numeric,
  unit            text,                          -- ex: "ppm", "%", "j"
  status          text NOT NULL DEFAULT 'green'
                  CHECK (status IN ('green', 'orange', 'red')),
  trend           text DEFAULT 'stable'
                  CHECK (trend IN ('up', 'down', 'stable')),
  comment         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── PROCESS REVIEWS ─────────────────────────────────────────
-- Revues de processus planifiées et réalisées
CREATE TABLE IF NOT EXISTS public.process_reviews (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  process_id   uuid REFERENCES public.processes(id) ON DELETE SET NULL,
  period       text NOT NULL,
  review_date  date,
  pilot_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'planned'
               CHECK (status IN ('planned', 'in_progress', 'done')),
  conclusion   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── TRIGGER updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actions_updated_at
  BEFORE UPDATE ON public.actions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_processes_updated_at
  BEFORE UPDATE ON public.processes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.process_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_reviews   ENABLE ROW LEVEL SECURITY;

-- Fonction helper : l'utilisateur connecté est-il membre du workspace ?
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Workspaces
CREATE POLICY "ws_select" ON public.workspaces
  FOR SELECT USING (public.is_workspace_member(id));
CREATE POLICY "ws_insert" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Members
CREATE POLICY "members_select" ON public.workspace_members
  FOR SELECT USING (public.is_workspace_member(workspace_id));

-- Processes
CREATE POLICY "processes_all" ON public.processes
  FOR ALL USING (public.is_workspace_member(workspace_id));

-- Actions
CREATE POLICY "actions_all" ON public.actions
  FOR ALL USING (public.is_workspace_member(workspace_id));

-- KPIs
CREATE POLICY "kpis_all" ON public.kpis
  FOR ALL USING (public.is_workspace_member(workspace_id));

-- Reviews
CREATE POLICY "reviews_all" ON public.process_reviews
  FOR ALL USING (public.is_workspace_member(workspace_id));

-- ─── WORKSPACE ASCALIS (initialisation) ──────────────────────
DO $$
DECLARE
  ws_id    uuid;
  admin_id uuid;
  client_id uuid;
BEGIN
  SELECT id INTO admin_id  FROM auth.users WHERE email = 'admin@ascalis.fr';
  SELECT id INTO client_id FROM auth.users WHERE email = 'client@demo.fr';

  IF admin_id IS NULL THEN
    RAISE NOTICE 'Utilisateur admin@ascalis.fr introuvable — workspace non créé.';
    RETURN;
  END IF;

  INSERT INTO public.workspaces (name, created_by)
  VALUES ('ASCALIS', admin_id)
  RETURNING id INTO ws_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, admin_id, 'admin');

  IF client_id IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (ws_id, client_id, 'member');
  END IF;

  RAISE NOTICE 'Workspace ASCALIS créé : %', ws_id;
END $$;
