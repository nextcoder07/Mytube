// scripts/seed.js — Simple Supabase seed helper (run after installing deps)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  try {
    const userId = 'seed-user-1';
    const email = 'seed@example.com';

    // Upsert user
    const { error: userError } = await supabase.from('users').upsert(
      {
        id: userId,
        email,
        display_name: 'Seed User',
        photo_url: '',
        role: 'user',
        subscription: 'free',
      },
      { onConflict: 'id' }
    );

    if (userError) throw userError;

    // Upsert profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        bio: 'Seed profile',
        learning_style: 'mixed',
        daily_goal_minutes: 30,
        streak: 0,
        total_xp: 0,
      },
      { onConflict: 'id' }
    );

    if (profileError) throw profileError;

    console.log('✅ Seed complete — user and profile upserted (id:', userId + ')');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    process.exit(1);
  }
}

seed();
