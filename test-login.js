// Script to test login directly
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing login...');
    
    // Test login with justin
    const justinCredentials = {
      username: 'justin',
      password: 'justin'
    };
    
    console.log(`Attempting to login with username: ${justinCredentials.username}, password: ${justinCredentials.password}`);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(justinCredentials)
    });
    
    const responseData = await response.json();
    
    console.log(`Login response status: ${response.status}`);
    console.log('Login response data:', responseData);
    
    if (response.ok) {
      console.log('Login successful!');
    } else {
      console.log('Login failed.');
    }
    
    return true;
  } catch (error) {
    console.error('Error testing login:', error);
    return false;
  }
}

// Run the function
testLogin()
  .then(success => {
    if (success) {
      console.log('Login test completed');
      process.exit(0);
    } else {
      console.error('Login test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
