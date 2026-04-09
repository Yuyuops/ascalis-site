// Script one-shot : met à jour les métadonnées des utilisateurs Supabase
// Lancer depuis next-app/ avec : node ../scripts/setup-users.mjs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans les variables d\'env')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const users = [
  {
    email: 'admin@ascalis.fr',
    metadata: { role: 'admin', name: 'Yukti Ranjan', initials: 'YR' }
  },
  {
    email: 'client@demo.fr',
    metadata: { role: 'client', name: 'Client Demo', initials: 'CD' }
  }
]

const { data: list, error: listErr } = await admin.auth.admin.listUsers()
if (listErr) { console.error('Erreur listUsers:', listErr.message); process.exit(1) }

for (const u of users) {
  const found = list.users.find(x => x.email === u.email)
  if (!found) { console.log(`⚠ Non trouvé : ${u.email}`); continue }

  const { error } = await admin.auth.admin.updateUserById(found.id, {
    user_metadata: u.metadata
  })

  if (error) console.error(`✗ ${u.email} :`, error.message)
  else console.log(`✓ ${u.email} → role=${u.metadata.role}, name=${u.metadata.name}`)
}
