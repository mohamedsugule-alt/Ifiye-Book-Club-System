import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually read .env
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

console.log("Testing Connection to:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        // Try to select from members
        const { count, error } = await supabase.from('members').select('*', { count: 'exact', head: true });

        if (error) {
            console.error("Supabase Error:", error);
            if (error.code === 'PGRST116') {
                console.log("Note: This error usually means the URL/Key is valid but the table doesn't exist yet or is private.");
            }
        } else {
            console.log("Success! Connection Established.");
            console.log("Member Count in DB:", count);
        }
    } catch (e) {
        console.error("Network/Script Error:", e);
    }
}

test();
