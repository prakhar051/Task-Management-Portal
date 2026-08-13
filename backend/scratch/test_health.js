async function testHealth() {
  const url = 'http://localhost:5000/health';
  console.log(`Sending GET request to ${url}...`);
  try {
    const response = await fetch(url);
    console.log(`Response Status: ${response.status}`);
    
    if (response.status !== 200) {
      console.error(`FAIL: Expected status 200, got ${response.status}`);
      process.exit(1);
    }
    
    const body = await response.json();
    console.log('Response Body:', JSON.stringify(body, null, 2));
    
    if (body.success !== true) {
      console.error(`FAIL: Expected success to be true, got ${body.success}`);
      process.exit(1);
    }
    
    if (body.database !== 'CONNECTED') {
      console.error(`FAIL: Expected database to be CONNECTED, got ${body.database}`);
      process.exit(1);
    }
    
    console.log('SUCCESS: Health check endpoint verified successfully!');
  } catch (err) {
    console.error('FAIL: Request failed with error:', err.message);
    process.exit(1);
  }
}

testHealth();
