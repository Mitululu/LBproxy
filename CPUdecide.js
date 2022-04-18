const http = require('http');
const proxy = require('http-proxy');

// const targets = [
//     'http://ec2-44-203-194-237.compute-1.amazonaws.com:8000',
//     'http://ec2-54-90-103-139.compute-1.amazonaws.com:8000',
//     'http://ec2-54-159-207-166.compute-1.amazonaws.com:8000',
//     'http://ec2-3-85-129-7.compute-1.amazonaws.com:8000',
//     'http://ec2-54-144-64-83.compute-1.amazonaws.com:8000',
//     'http://ec2-54-152-11-82.compute-1.amazonaws.com:8000',
//     'http://ec2-52-91-35-74.compute-1.amazonaws.com:8000',
//     'http://ec2-54-174-93-234.compute-1.amazonaws.com:8000',
//     'http://ec2-52-207-255-70.compute-1.amazonaws.com:8000',
//     'http://ec2-18-212-212-83.compute-1.amazonaws.com:8000'
// ];
const targets = [
    'http://localhost:8000',
    'http://localhost:8001'
];

let target_times = [0, 0];
let i = 1

const proxyServer = proxy.createProxyServer();
proxyServer.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('start-time', Date.now());
});

proxyServer.on('proxyRes', function (proxyRes, req, res) {
    target_times[i] = proxyRes.headers['response-time'];
    console.log(`Target index ${i} (${targets[i]}) had a response time of ${target_times[i]} ms`);
});

// RandomLB target index: Math.floor(Math.random()*3)

http.createServer((req, res) => {
    // let i = Math.floor(Math.random()*2);
    proxyServer.web(req, res, {target: targets[i]});
}).listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
