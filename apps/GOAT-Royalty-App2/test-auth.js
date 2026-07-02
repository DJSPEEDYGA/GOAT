#!/usr/bin/env node

// Test Supabase Authentication
const { auth } = require('./lib/auth');

console.log('🔧 Testing Supabase Authentication\n');

async function testAuth() {
    try {
        console.log('1️⃣ Testing Sign Up...');
        
        const signUpResult = await auth.signUp('test@example.com', 'password123', {
            full_name: 'Test User'
        });
        
        if (signUpResult.error) {
            console.log('❌ Sign Up Error:', signUpResult.error.message);
        } else {
            console.log('✅ Sign Up Successful');
            console.log('   User:', signUpResult.data.user?.email);
        }

        console.log('\n2️⃣ Testing Sign In...');
        
        const signInResult = await auth.signIn('test@example.com', 'password123');
        
        if (signInResult.error) {
            console.log('❌ Sign In Error:', signInResult.error.message);
        } else {
            console.log('✅ Sign In Successful');
            console.log('   User:', signInResult.data.user?.email);
            console.log('   Session Active:', !!signInResult.data.session);
        }

        console.log('\n3️⃣ Testing Session Management...');
        
        const sessionResult = await auth.getSession();
        
        if (sessionResult.error) {
            console.log('❌ Session Error:', sessionResult.error.message);
        } else {
            console.log('✅ Session Management Working');
            console.log('   Active Session:', !!sessionResult.session);
        }

        console.log('\n🎉 Authentication tests complete!');
        console.log('\n💡 You can now test the login page with:');
        console.log('   Email: test@example.com');
        console.log('   Password: password123');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testAuth();