#!/usr/bin/env node

// Quick Fix Script for Supabase Integration
// This script helps verify and fix Supabase connection issues

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 GOAT Royalty App - Supabase Quick Fix Tool\n');
console.log('📍 Checking current configuration...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('💡 Creating .env.local file with template...\n');
    
    const template = `# GOAT Royalty App - Supabase Configuration
# Replace these with your actual Supabase project credentials
# Get these from: https://supabase.com/dashboard/project/_/settings/api-keys

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI API Key (for Ms Vanessa AI)
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
`;
    
    fs.writeFileSync(envPath, template);
    console.log('✅ .env.local file created with template\n');
}

// Load current environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Current Configuration:');
console.log(`Project URL: ${supabaseUrl}`);
console.log(`API Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not found'}\n`);

// Check if using placeholder values
if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
    console.log('❌ ISSUE DETECTED: Using placeholder Project URL');
    console.log('🔧 SOLUTION: Update NEXT_PUBLIC_SUPABASE_URL in .env.local\n');
    console.log('📖 Follow these steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy the Project URL');
    console.log('5. Replace the placeholder in .env.local\n');
}

if (!supabaseKey || supabaseKey === 'your_anon_key_here') {
    console.log('❌ ISSUE DETECTED: Using placeholder API Key');
    console.log('🔧 SOLUTION: Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n');
    console.log('📖 Follow these steps:');
    console.log('1. In Supabase dashboard, go to Settings → API');
    console.log('2. Copy the "anon public" key');
    console.log('3. Replace the placeholder in .env.local\n');
}

// Test connection if real credentials are present
if (supabaseUrl && supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseKey && supabaseKey !== 'your_anon_key_here') {
    
    console.log('✅ Real credentials detected - testing connection...\n');
    
    // Import Supabase client and test
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    async function testConnection() {
        try {
            console.log('📡 Connecting to Supabase...');
            const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
            
            if (error) {
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                    console.log('⚠️  Connection successful, but tables not found');
                    console.log('💡 SOLUTION: Run SQL-SCRIPTS.sql in Supabase SQL Editor\n');
                    console.log('📋 Next steps:');
                    console.log('1. Go to your Supabase project');
                    console.log('2. Click "SQL Editor" in left sidebar');
                    console.log('3. Click "New query"');
                    console.log('4. Copy contents of SQL-SCRIPTS.sql');
                    console.log('5. Paste and click "Run"\n');
                } else {
                    console.log('❌ Connection failed:', error.message);
                    console.log('🔧 Check:');
                    console.log('- Project URL is correct');
                    console.log('- API key is valid');
                    console.log('- Project is active (not paused)\n');
                }
            } else {
                console.log('🎉 SUCCESS: Supabase connection is working!');
                console.log('✅ Database tables are ready');
                console.log('🚀 Your GOAT Royalty App is fully configured!\n');
            }
        } catch (error) {
            console.log('❌ Connection error:', error.message);
            console.log('🔧 Check your internet connection and credentials\n');
        }
    }
    
    testConnection();
} else {
    console.log('🔧 ACTION REQUIRED: Update credentials in .env.local\n');
    console.log('📖 Complete guide available in: SUPABASE_CREDENTIALS_HELPER.md');
    console.log('🚀 After updating credentials, run this script again to verify\n');
}

console.log('📋 Quick Reference:');
console.log('Supabase Dashboard: https://supabase.com/dashboard');
console.log('API Keys Location: Settings → API → API Keys');
console.log('SQL Editor: In project dashboard → SQL Editor\n');

console.log('💡 Need help? Check SUPABASE_CREDENTIALS_HELPER.md for detailed instructions');