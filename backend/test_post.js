const http = require('http');
const data = JSON.stringify({
  image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
  filename: 'test.png',
  location: 'Testville'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  console.log('STATUS', res.statusCode);
  res.on('data', (c) => body += c);
  res.on('end', () => {
    console.log('BODY', body);
  });
});

req.on('error', (e) => console.error('ERR', e));
req.write(data);
req.end();
