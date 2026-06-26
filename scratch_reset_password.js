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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const adminUser = users.find(u => u.email === 'admin@gmail.com');
  if (!adminUser) {
    console.error('Admin user not found');
    return;
  }
  const { data, error } = await supabase.auth.admin.updateUserById(adminUser.id, {
    password: 'adminpassword123'
  });
  if (error) {
    console.error('Error resetting password:', error.message);
  } else {
    console.log('Password successfully reset to adminpassword123 for admin@gmail.com');
  }
}

main().catch(console.error);
