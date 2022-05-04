const http = require('http');
const proxy = require('http-proxy');

const proxyServer = proxy.createProxyServer()
// const targets = [
//     'http://ec2-54-152-11-82.compute-1.amazonaws.com:8000',
//     'http://ec2-52-91-35-74.compute-1.amazonaws.com:8000',
//     'http://ec2-54-174-93-234.compute-1.amazonaws.com:8000',
//     'http://ec2-52-207-255-70.compute-1.amazonaws.com:8000',
//     'http://ec2-18-212-212-83.compute-1.amazonaws.com:8000'
// ];
const targets = [
    'http://localhost:8000',
    'http://localhost:8001'
]

var i = -1

server = http.createServer((req, res) => {
    i = (i+1) % targets.length;
    // console.log("Current index is " + i)
    proxyServer.web(req, res, {target: targets[i]});
})

server.listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
