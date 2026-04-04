const { createClient } = require('@supabase/supabase-js');
const { getRequiredEnv } = require('./supabaseAdmin');

function getAccessToken(event) {
  const header = event?.headers?.authorization || event?.headers?.Authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function createUserSupabaseClient(event) {
  const accessToken = getAccessToken(event);

  return createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_ANON_KEY'),
    {
      global: accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
}

module.exports = {
  getAccessToken,
  createUserSupabaseClient
};
