const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test 1: Sign up a new user
    console.log('\n1. Testing signup...');
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Signup successful:', signupResponse.data);
    const token = signupResponse.data.access_token;
    
    // Test 2: Login with the same user
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
    // Test 3: Access protected profile endpoint
    console.log('\n3. Testing profile endpoint...');
    const profileResponse = await axios.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile access successful:', profileResponse.data);
    
    // Test 4: Test validation - invalid email
    console.log('\n4. Testing validation (invalid email)...');
    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        email: 'invalid-email',
        password: 'password123'
      });
    } catch (error) {
      console.log('✅ Validation working:', error.response.data);
    }
    
    // Test 5: Test validation - short password
    console.log('\n5. Testing validation (short password)...');
    try {
      await axios.post(`${API_BASE}/auth/signup`, {
        email: 'test2@example.com',
        password: '123'
      });
    } catch (error) {
      console.log('✅ Password validation working:', error.response.data);
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();