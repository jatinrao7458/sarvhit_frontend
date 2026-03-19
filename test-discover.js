const jwt = require('jsonwebtoken');

// Create a test token
const testToken = jwt.sign(
  { userId: '123', email: 'test@test.com', userType: 'ngo' },
  'your_jwt_secret_key_change_in_production',
  { expiresIn: '1d' }
);

console.log('Test Token:', testToken);

// Test the endpoint
fetch('http://localhost:5001/api/discover/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('Error:', err);
  });
