import React from 'react';

const BasicImageTest = () => {
  const testImages = [
    'http://localhost:5000/public/uploads/t6-1753543922392.jpg',
    'http://localhost:5000/public/uploads/t6-1753543963683.jpg',
    'http://localhost:5000/public/uploads/t6-1753543973921.jpg',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Basic Image Test</h1>
      <p>Testing direct image URLs without any API calls</p>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Test 1: Direct Local Images</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {testImages.slice(0, 3).map((imageUrl, index) => (
            <div key={index} style={{ border: '2px solid #ccc', padding: '10px' }}>
              <h3>Local Image {index + 1}</h3>
              <p style={{ fontSize: '12px', wordBreak: 'break-all', color: '#666' }}>
                {imageUrl}
              </p>
              <img 
                src={imageUrl}
                alt={`Test ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: '150px', 
                  objectFit: 'cover',
                  border: '1px solid #ddd'
                }}
                onLoad={() => {
                  console.log(`✅ Local image ${index + 1} loaded:`, imageUrl);
                }}
                onError={(e) => {
                  console.error(`❌ Local image ${index + 1} failed:`, imageUrl);
                  e.target.style.backgroundColor = '#ffcccc';
                  e.target.alt = 'FAILED TO LOAD';
                }}
              />
              <div style={{ marginTop: '5px', fontSize: '12px' }}>
                Status: <span id={`status-${index}`}>Loading...</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Test 2: External Image (Control)</h2>
        <div style={{ border: '2px solid #ccc', padding: '10px', maxWidth: '300px' }}>
          <h3>Unsplash Image</h3>
          <p style={{ fontSize: '12px', wordBreak: 'break-all', color: '#666' }}>
            {testImages[3]}
          </p>
          <img 
            src={testImages[3]}
            alt="External test"
            style={{ 
              width: '100%', 
              height: '150px', 
              objectFit: 'cover',
              border: '1px solid #ddd'
            }}
            onLoad={() => {
              console.log('✅ External image loaded');
            }}
            onError={() => {
              console.error('❌ External image failed');
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Test 3: Manual URL Test</h2>
        <p>Try opening these URLs directly in a new tab:</p>
        <ul>
          {testImages.slice(0, 3).map((url, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px' }}>
                {url}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Test 4: Fetch Test</h2>
        <button 
          onClick={async () => {
            const testUrl = testImages[0];
            try {
              const response = await fetch(testUrl, { method: 'HEAD' });
              console.log('Fetch test result:', {
                url: testUrl,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
              });
              alert(`Fetch test: ${response.status} ${response.statusText}`);
            } catch (error) {
              console.error('Fetch test error:', error);
              alert(`Fetch test failed: ${error.message}`);
            }
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Fetch API
        </button>
      </div>
    </div>
  );
};

export default BasicImageTest;
