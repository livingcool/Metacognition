const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3005,
  path: '/api/session/408782e8-83f4-473c-ba85-4f17f7a35c51/message?userId=verification_user_node&text=Hello%20Mirror',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`CHUNK: ${chunk.toString()}`);
  });
  res.on('end', () => {
    console.log('Stream concluded.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
