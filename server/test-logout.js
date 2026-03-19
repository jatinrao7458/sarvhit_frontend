// Test script to demonstrate logout functionality
// Run with: node test-logout.js

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5001/api';

// Test user credentials
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  userType: 'volunteer'
};

async function testLogout() {
  try {
    console.log('🔄 Testing logout functionality...\n');

    // 1. Register test user
    console.log('1. Registering test user...');
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData.success ? '✅ Success' : '❌ Failed');

    if (!signupData.success) {
      console.log('User might already exist, trying login...');
    }

    // 2. Login to get token
    console.log('\n2. Logging in to get token...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful, got token');

    // 3. Access protected route (should work)
    console.log('\n3. Accessing protected profile route (should work)...');
    const profileResponse1 = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData1 = await profileResponse1.json();
    console.log('Profile access before logout:', profileData1.success ? '✅ Success' : '❌ Failed');

    // 4. Logout
    console.log('\n4. Logging out (invalidating token)...');
    const logoutResponse = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const logoutData = await logoutResponse.json();
    console.log('Logout response:', logoutData.success ? '✅ Success' : '❌ Failed');

    // 5. Try to access protected route again (should fail)
    console.log('\n5. Accessing protected profile route after logout (should fail)...');
    const profileResponse2 = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData2 = await profileResponse2.json();
    console.log('Profile access after logout:', profileData2.success ? '❌ Should have failed!' : '✅ Correctly blocked');

    console.log('\n🎉 Logout functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLogout();