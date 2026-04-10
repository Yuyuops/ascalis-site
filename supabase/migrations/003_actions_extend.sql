-- ============================================================
-- ASCALIS — Migration 003 : Extension actions + tool_events
-- ============================================================

-- Colonnes manquantes dans actions
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS owner_name     text,
  ADD COLUMN IF NOT EXISTS resources      text,
  ADD COLUMN IF NOT EXISTS linked_kpi_text text;

-- Ajouter 'blocked' au statut (recréer la contrainte)
ALTER TABLE public.actions DROP CONSTRAINT IF EXISTS actions_status_check;
ALTER TABLE public.actions ADD CONSTRAINT actions_status_check
  CHECK (status IN ('open', 'in_progress', 'blocked', 'done', 'cancelled'));

-- Table des événements outils (tracking usage)
CREATE TABLE IF NOT EXISTS public.tool_events (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug    text NOT NULL,
  event_type   text NOT NULL,  -- open | create | delete | export_csv | export_json
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_events_insert" ON public.tool_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tool_events_select" ON public.tool_events
  FOR SELECT USING (public.is_workspace_member(workspace_id));

RAISE NOTICE 'Migration 003 OK';
