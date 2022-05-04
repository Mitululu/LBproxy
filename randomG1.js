const http = require('http');
const proxy = require('http-proxy');

const proxyServer = proxy.createProxyServer()
const targets = [
    "http://18.233.161.18:8000/",
    "http://54.210.166.161:8000/",
    "http://52.204.53.171:8000/",
    "http://44.204.61.165:8000/",
    "http://44.204.178.251:8000/",
    "http://44.203.123.156:8000/",
    "http://44.202.138.183:8000/",
    "http://54.209.192.12:8000/",
    "http://44.201.194.157:8000/",
    "http://54.157.8.226:8000/",
    "http://3.94.10.200:8000/",
    "http://44.204.83.211:8000/"
];
// const targets = [
//     'http://localhost:8000',
//     'http://localhost:8001'
// ]

// RandomLB target index: Math.floor(Math.random()*3)

http.createServer((req, res) => {
    let i = Math.floor(Math.random()*targets.length);
    proxyServer.web(req, res, {target: targets[i]});
}).listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
