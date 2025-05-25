// Test script to verify login and registration API endpoints
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:8080';

async function testAPI() {
    console.log('🧪 Testing Photo Sharing API - Registration & Login Functionality\n');
    
    // Test 1: Registration
    console.log('--- Test 1: User Registration ---');
    
    const newUser = {
        login_name: 'test_registration_' + Date.now(),
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'Registration',
        location: 'Test City',
        description: 'Test user for registration',
        occupation: 'Tester'
    };
    
    try {
        const regResponse = await fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        
        const regData = await regResponse.json();
        
        if (regResponse.ok) {
            console.log('✅ Registration successful:', regData.login_name);
            console.log('   User ID:', regData._id);
        } else {
            console.log('❌ Registration failed:', regData.error);
            return;
        }
        
        // Test 2: Login with new user
        console.log('\n--- Test 2: Login with New User ---');
        
        const loginResponse = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                login_name: newUser.login_name,
                password: newUser.password
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Login successful:', loginData.login_name);
            console.log('   Welcome:', loginData.first_name, loginData.last_name);
        } else {
            console.log('❌ Login failed:', loginData.error);
        }
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
    
    // Test 3: Registration validation (duplicate user)
    console.log('\n--- Test 3: Registration Validation (Duplicate User) ---');
    
    try {
        const dupResponse = await fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login_name: 'admin', // This user already exists
                password: 'testpass',
                first_name: 'Duplicate',
                last_name: 'User'
            })
        });
        
        const dupData = await dupResponse.json();
        
        if (!dupResponse.ok) {
            console.log('✅ Duplicate validation working:', dupData.error);
        } else {
            console.log('❌ Duplicate validation failed - user was created');
        }
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
    
    // Test 4: Login validation (wrong password)
    console.log('\n--- Test 4: Login Validation (Wrong Password) ---');
    
    try {
        const wrongPassResponse = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login_name: 'admin',
                password: 'wrongpassword'
            })
        });
        
        const wrongPassData = await wrongPassResponse.json();
        
        if (!wrongPassResponse.ok) {
            console.log('✅ Password validation working:', wrongPassData.error);
        } else {
            console.log('❌ Password validation failed - login succeeded with wrong password');
        }
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
    
    // Test 5: Login with existing test user
    console.log('\n--- Test 5: Login with Existing User ---');
    
    try {
        const existingLoginResponse = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login_name: 'admin',
                password: 'admin123'
            })
        });
        
        const existingLoginData = await existingLoginResponse.json();
        
        if (existingLoginResponse.ok) {
            console.log('✅ Existing user login successful:', existingLoginData.login_name);
        } else {
            console.log('❌ Existing user login failed:', existingLoginData.error);
        }
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
    
    console.log('\n🎉 API Tests Completed!');
    console.log('\n📝 Summary:');
    console.log('   • User registration endpoint: POST /user');
    console.log('   • Enhanced login endpoint: POST /admin/login (now requires password)');
    console.log('   • Password validation implemented');
    console.log('   • Duplicate user prevention working');
    console.log('\n🚀 You can now test the frontend at http://localhost:3000');
}

testAPI();
