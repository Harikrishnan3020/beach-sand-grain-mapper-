async function testAPI() {
  try {
    console.log('Testing API endpoints...');

    // Test health endpoint
    try {
      const healthResponse = await fetch('http://localhost:8000/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health endpoint:', healthData);
      } else {
        console.log('❌ Health endpoint failed:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message);
    }

    // Test analyze endpoint with minimal data
    try {
      const testData = {
        image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        filename: 'test.jpg'
      };

      const analyzeResponse = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        console.log('✅ Analyze endpoint response:');
        console.log('  - Total grains:', analyzeData.totalGrains);
        console.log('  - Location:', analyzeData.location);
        console.log('  - Coordinates:', analyzeData.coordinates);
        console.log('  - Soil type:', analyzeData.soilType);
      } else {
        console.log('❌ Analyze endpoint failed:', analyzeResponse.status);
        const errorText = await analyzeResponse.text();
        console.log('  Error details:', errorText);
      }

    } catch (error) {
      console.log('❌ Analyze endpoint failed:', error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
