
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    const targetName = 'Mohamed Sugule';
    console.log(`🔍 Looking for user: ${targetName}...`);

    // 1. Find Member ID
    const { data: members, error: memberError } = await supabase
        .from('members')
        .select('id, name')
        .ilike('name', `%${targetName}%`);

    if (memberError) {
        console.error("Error finding member:", memberError);
        return;
    }

    if (!members || members.length === 0) {
        console.log("⚠️ Member not found.");
        return;
    }

    const member = members[0];
    console.log(`✅ Found member: ${member.name} (ID: ${member.id})`);

    // 2. Delete Logs
    console.log(`🗑️ Deleting logs for member ID: ${member.id}...`);
    const { error: deleteError, count } = await supabase
        .from('logs')
        .delete({ count: 'exact' })
        .eq('member_id', member.id);

    if (deleteError) {
        console.error("Error deleting logs:", deleteError);
    } else {
        console.log(`🎉 Success! Deleted logs.`);
    }
}

cleanup();
