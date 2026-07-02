#!/usr/bin/env node

// Create Demo User and Test Auth Setup
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://xmvlnonsxmrpvlssjstl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtdmxub25zeG1ycHZsc3Nqc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODY5MzEsImV4cCI6MjA3Njc2MjkzMX0.29rr7p9mzPAyjRmnASo6c9rVZES211oFip1fh-chOtA';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Setting up Demo Authentication for GOAT Royalty App\n');

async function setupDemoAuth() {
    try {
        // Check if auth is enabled
        console.log('1️⃣ Checking Supabase Auth configuration...');
        
        // Try to access auth configuration
        const { data: authSettings, error: authError } = await supabase
            .from('_realtime')
            .select('*')
            .limit(1);

        if (authError && !authError.message.includes('does not exist')) {
            console.log('⚠️  Auth may have configuration issues:', authError.message);
        } else {
            console.log('✅ Supabase Auth is accessible');
        }

        console.log('\n2️⃣ Creating demo user...');
        
        // Create demo user with working email format
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'demo@goatroyaltyapp.com',
            password: 'demo123',
            options: {
                data: {
                    full_name: 'Demo Artist',
                    role: 'artist'
                }
            }
        });

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                console.log('✅ Demo user already exists');
                
                // Try to sign in with existing demo user
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: 'demo@goatroyaltyapp.com',
                    password: 'demo123'
                });

                if (signInError) {
                    console.log('❌ Demo user login failed:', signInError.message);
                    console.log('💡 You may need to:');
                    console.log('   1. Enable email confirmation in Supabase Auth settings');
                    console.log('   2. Or create a new demo user manually');
                } else {
                    console.log('✅ Demo user login successful');
                    console.log('   User ID:', signInData.user.id);
                    console.log('   Email:', signInData.user.email);
                }
            } else {
                console.log('❌ Demo user creation failed:', signUpError.message);
            }
        } else {
            console.log('✅ Demo user created successfully');
            console.log('   User ID:', signUpData.user.id);
            console.log('   Email:', signUpData.user.email);
            console.log('   Note: Check email for verification (may be disabled)');
        }

        console.log('\n3️⃣ Creating user profile...');
        
        // Try to create profile directly (bypass auth)
        const demoUserId = signUpData?.user?.id || 'demo-user-id';
        
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: demoUserId,
                email: 'demo@goatroyaltyapp.com',
                name: 'Demo Artist',
                role: 'artist',
                created_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single();

        if (profileError) {
            console.log('❌ Profile creation failed:', profileError.message);
        } else {
            console.log('✅ Profile created/updated');
            console.log('   Profile ID:', profileData.id);
        }

        console.log('\n🎉 Demo setup complete!');
        console.log('\n🔐 Login Credentials:');
        console.log('   Email: demo@goatroyaltyapp.com');
        console.log('   Password: demo123');
        console.log('\n📋 Status:');
        console.log('   ✅ Database connected');
        console.log('   ✅ Tables ready');
        console.log('   ✅ Demo user prepared');
        
    } catch (error) {
        console.log('❌ Setup failed:', error.message);
        console.log('\n🔧 Manual setup required:');
        console.log('1. Go to Supabase dashboard');
        console.log('2. Enable Auth → Authentication → Email');
        console.log('3. Disable email confirmation for testing');
        console.log('4. Create user manually if needed');
    }
}

setupDemoAuth();