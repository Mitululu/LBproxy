const http = require('http');
const proxy = require('http-proxy');

const proxyServer = proxy.createProxyServer()
const targets = [
    "http://ec2-34-204-44-157.compute-1.amazonaws.com:8000/",
    "http://ec2-18-232-169-203.compute-1.amazonaws.com:8000/",
    "http://ec2-54-227-67-16.compute-1.amazonaws.com:8000/",
    "http://ec2-54-234-66-236.compute-1.amazonaws.com:8000/",
    "http://ec2-107-23-13-235.compute-1.amazonaws.com:8000/",
    "http://ec2-3-83-178-231.compute-1.amazonaws.com:8000/",
    "http://ec2-18-212-3-75.compute-1.amazonaws.com:8000/",
    "http://ec2-18-233-155-12.compute-1.amazonaws.com:8000/",
    "http://ec2-54-173-81-57.compute-1.amazonaws.com:8000/",
    "http://ec2-174-129-145-113.compute-1.amazonaws.com:8000/",
    "http://ec2-52-54-254-23.compute-1.amazonaws.com:8000/",
    "http://ec2-54-172-39-80.compute-1.amazonaws.com:8000/"
];

var i = -1

server = http.createServer((req, res) => {
    i = (i+1) % targets.length;
    // console.log("Current index is " + i)
    proxyServer.web(req, res, {target: targets[i]});
})

server.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
