const http = require('http');
const proxy = require('http-proxy');

const proxyServer = proxy.createProxyServer()
const targets = [
    "http://ec2-3-82-151-158.compute-1.amazonaws.com:8000/",
    "http://ec2-3-91-200-37.compute-1.amazonaws.com:8000/",
    "http://ec2-3-89-125-41.compute-1.amazonaws.com:8000/",
    "http://ec2-54-173-181-0.compute-1.amazonaws.com:8000/",
    "http://ec2-54-85-137-42.compute-1.amazonaws.com:8000/",
    "http://ec2-54-147-245-190.compute-1.amazonaws.com:8000/",
    "http://ec2-54-175-24-79.compute-1.amazonaws.com:8000/",
    "http://ec2-3-87-228-79.compute-1.amazonaws.com:8000/",
    "http://ec2-34-203-202-4.compute-1.amazonaws.com:8000/",
    "http://ec2-3-91-188-60.compute-1.amazonaws.com:8000/",
    "http://ec2-34-203-243-93.compute-1.amazonaws.com:8000/",
    "http://ec2-3-88-210-249.compute-1.amazonaws.com:8000/"
];

var i = -1

server = http.createServer((req, res) => {
    i = (i+1) % targets.length;
    // console.log("Current index is " + i)
    proxyServer.web(req, res, {target: targets[i]});
})

server.listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
