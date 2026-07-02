#!/usr/bin/env node

// Test different Supabase key formats
require('dotenv').config({ path: '.env.local' });

console.log('🔑 Testing different Supabase key configurations\n');

// Test all available Supabase keys
const keys = {
    'SUPABASE_KEY': process.env.SUPABASE_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
};

const supabaseUrl = 'https://xmvlnonsxmrpvlssjstl.supabase.co';

async function testKey(keyName, keyValue) {
    if (!keyValue) {
        console.log(`❌ ${keyName}: Not found in environment`);
        return false;
    }

    console.log(`\n🔧 Testing ${keyName}:`);
    console.log(`   Key: ${keyValue.substring(0, 30)}...`);
    console.log(`   Length: ${keyValue.length}`);

    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, keyValue);

        const { data, error } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });

        if (error) {
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log(`✅ ${keyName}: CONNECTION SUCCESSFUL (tables need to be created)`);
                return true;
            } else {
                console.log(`❌ ${keyName}: ${error.message}`);
                return false;
            }
        } else {
            console.log(`✅ ${keyName}: CONNECTION SUCCESSFUL (tables exist)`);
            return true;
        }
    } catch (error) {
        console.log(`❌ ${keyName}: Connection failed - ${error.message}`);
        return false;
    }
}

async function testAllKeys() {
    let workingKey = null;
    let workingKeyName = null;

    for (const [keyName, keyValue] of Object.entries(keys)) {
        const works = await testKey(keyName, keyValue);
        if (works) {
            workingKey = keyValue;
            workingKeyName = keyName;
            break;
        }
    }

    if (workingKey) {
        console.log(`\n🎉 FOUND WORKING KEY: ${workingKeyName}`);
        console.log('💡 Use this key in your Supabase client configuration\n');
        
        // Update the environment file with the working key
        const fs = require('fs');
        const envContent = fs.readFileSync('.env.local', 'utf8');
        
        // Update the SUPABASE_KEY to use the working key
        const updatedEnv = envContent.replace(
            /SUPABASE_KEY=.*/,
            `SUPABASE_KEY=${workingKey}`
        );
        
        fs.writeFileSync('.env.local', updatedEnv);
        console.log('✅ Updated .env.local with working key');
        
    } else {
        console.log('\n❌ No working keys found');
        console.log('💡 You may need to:');
        console.log('   1. Generate new API keys in Supabase dashboard');
        console.log('   2. Check if project is active');
        console.log('   3. Verify project URL is correct');
    }
}

testAllKeys();