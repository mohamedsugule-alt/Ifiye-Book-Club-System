
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
    console.log("🧹 Starting Social Data Cleanup...");

    // 1. Delete All Discussion Points
    const { error: discError, count: discCount } = await supabase
        .from('discussion_points')
        .delete({ count: 'exact' })
        .neq('id', 'placeholder'); // Delete all

    if (discError) console.error("Error deleting discussions:", discError);
    else console.log(`✅ Deleted all Discussion Points.`);

    // 2. Delete All Quotes
    const { error: quoteError, count: quoteCount } = await supabase
        .from('quotes')
        .delete({ count: 'exact' })
        .neq('id', 'placeholder'); // Delete all

    if (quoteError) console.error("Error deleting quotes:", quoteError);
    else console.log(`✅ Deleted all Quotes.`);

    console.log("🎉 Cleanup Complete.");
}

cleanup();
