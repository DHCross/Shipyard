
import http from 'http';

const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/files',
    method: 'GET',
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY LENGTH:', data.length);
        if (data.includes('page.tsx')) {
            console.log('SUCCESS: page.tsx found in response.');
        } else {
            console.log('FAILURE: page.tsx NOT found via grep.');
            console.log('Snippet:', data.substring(0, 200));
        }
    });
});

req.on('error', (e) => {
    console.error(`PROBLEM WITH REQUEST: ${e.message}`);
});

req.end();
