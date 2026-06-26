import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = 'c:/Users/NXTWAVE/Desktop/brave/handloomOPS/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('No service role key found in .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('Fetching users...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error.message);
    return;
  }
  
  console.log(`Found ${users.length} users:`);
  users.forEach(u => {
    console.log(`- Email: ${u.email}, ID: ${u.id}, Created At: ${u.created_at}`);
  });

  if (users.length === 0) {
    console.log('No users found. Creating a default admin user...');
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword123';
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });
    if (createError) {
      console.error('Error creating admin user:', createError.message);
    } else {
      console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
    }
  }
}

main().catch(console.error);
