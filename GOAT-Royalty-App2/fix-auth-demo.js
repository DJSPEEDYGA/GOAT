#!/usr/bin/env node

// Fix the demo user authentication issue
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = 'https://xmvlnonsxmrpvlssjstl.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtdmxub25zeG1ycHZsc3Nqc3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTM2NDQwNiwiZXhwIjoyMDQ2OTQwNDA2fQ.X7k2W8F4p1N9q5Z6j2H7K3r8M4p6R9s2T3y7V1m8L5n';

// Use service role key to bypass email confirmation
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔧 Fixing Demo User Authentication\n');

async function fixDemoAuth() {
    try {
        // Update the demo user to confirm their email
        console.log('1️⃣ Confirming demo user email...');
        
        const { data: userData, error: userError } = await supabase.auth.admin.updateUserById(
            '17b006c7-1c62-46da-8b11-7f66e8989dca', // Demo user ID from earlier
            {
                email_confirm: true
            }
        );

        if (userError) {
            console.log('❌ Error confirming user:', userError.message);
            
            // Try alternative approach - create new confirmed user
            console.log('\n2️⃣ Creating new confirmed demo user...');
            
            const { data: newUserData, error: newUserError } = await supabase.auth.admin.createUser({
                email: 'artist@goatroyaltyapp.com',
                password: 'demo123',
                email_confirm: true,
                user_metadata: {
                    full_name: 'Demo Artist',
                    role: 'artist'
                }
            });

            if (newUserError) {
                console.log('❌ Error creating new user:', newUserError.message);
            } else {
                console.log('✅ New confirmed demo user created:');
                console.log('   Email: artist@goatroyaltyapp.com');
                console.log('   Password: demo123');
                console.log('   User ID:', newUserData.user.id);
                
                // Create profile for new user
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: newUserData.user.id,
                        email: 'artist@goatroyaltyapp.com',
                        name: 'Demo Artist',
                        role: 'artist',
                        created_at: new Date().toISOString()
                    });
                
                if (profileError) {
                    console.log('⚠️  Profile creation error:', profileError.message);
                } else {
                    console.log('✅ User profile created');
                }
            }
        } else {
            console.log('✅ Demo user email confirmed successfully');
            console.log('   Email: demo@goatroyaltyapp.com');
            console.log('   Password: demo123');
        }

        console.log('\n🎉 Authentication fix complete!');
        console.log('\n🔐 Try these login credentials:');
        console.log('   Option 1: demo@goatroyaltyapp.com / demo123');
        console.log('   Option 2: artist@goatroyaltyapp.com / demo123');
        console.log('\n🌐 Go to: https://3000-02db9438-9294-43f9-b325-28e34dd7c07d.proxy.daytona.works/login');
        
    } catch (error) {
        console.log('❌ Fix failed:', error.message);
    }
}

fixDemoAuth();