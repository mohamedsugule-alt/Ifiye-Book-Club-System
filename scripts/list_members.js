
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listMembers() {
    console.log("👥 Fetching Member Directory...");
    const { data: members, error } = await supabase.from('members').select('id, name, role');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("\n-------------------------------------------");
    console.log("  VALID LOGIN CREDENTIALS");
    console.log("-------------------------------------------");
    console.log("  Password (for ALL users): 'admin' or 'member'");
    console.log("-------------------------------------------");
    console.log("  USERNAME (Choose any Name or ID below):");
    console.log("-------------------------------------------");

    members.forEach(m => {
        console.log(`  👤 ${m.name.padEnd(20)} | ID: ${m.id} | Role: ${m.role}`);
    });
    console.log("-------------------------------------------\n");
}

listMembers();
