import https from 'https';
import zlib from 'zlib';

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/repos/kingkideng/StarFate/actions/jobs/75311661119/logs',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js',
    // We cannot pass a token unless we know one. Wait, are logs public?
    // Anonymous REST API access for logs is allowed if the repository is public and we use a proper client. Let's redirect...
  }
};

const req = https.request(options, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    // Follow redirect to get actual logs
    https.get(res.headers.location, (logRes) => {
      let data = '';
      logRes.on('data', chunk => data += chunk);
      logRes.on('end', () => console.log(data));
    });
  } else {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  }
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
