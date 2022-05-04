// Video stream load balancer with decision based on
// epsilon-greedy reinforcement learning algorithm with
// video server response time as the metric.

// Tracks average of last 10 response times of each video server
// and chooses the lowest at a rate of 1/epsilon (exploitation)
// and a server at random otherwise (exploration).

const http = require('http');
const proxy = require('http-proxy');

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
// ];

let epsilon = 0.5, initial_explore = 5;
// (1/epsilon) is the chance for exploitation
// initial_explore is how many roundrobin iterations for initialization
//     and the number of most recent response times recorded

let target_times = [], avg_times = [], initialize = true;
let time_count = 0, maxcount = initial_explore * targets.length;
let i = -1; // current target index
let minInd = 0; // target index with lowest avg response time

for(let j = 0; j < targets.length; j++){
    target_times.push([]);
    avg_times.push(0);
}

const proxyServer = proxy.createProxyServer();
proxyServer.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('start-time', Date.now());
});

proxyServer.on('proxyRes', function (proxyRes, req, res) {
    rtime = Number(proxyRes.headers['response-time'])
    if(!rtime) return;
    target_times[i].push(rtime);

    if(initialize){
        console.log("initialize step")
        time_count += 1;
        avg_times[i] += rtime

        if(time_count >= maxcount){
            initialize = false;
            for(let j = 0; j < avg_times.length; j++){
                avg_times[j] /= initial_explore;
                if(avg_times[j] < avg_times[minInd]) minInd = j;
            }
            // console.log(avg_times.toString());
            // console.log(`First minInd is ${minInd}`);
        }
    } else {
        oldtime = target_times[i].shift();
        avg_times[i] += (rtime - oldtime) / initial_explore;
        // console.log(`New avg time at index ${i} is ${avg_times[i]}`)
        if(avg_times[i] < avg_times[minInd]){
            minInd = i;
            // console.log(`New minInd is ${minInd}`);
        }
    }
    console.log(`Target index ${i} (${targets[i]}) had a response time of ${avg_times[i]} ms`);
});

// RandomLB target index: Math.floor(Math.random()*3)

http.createServer((req, res) => {
    if(initialize){
        i = (i + 1) % targets.length;
    } else {
        roll = Math.random();
        if(roll < epsilon){
            i = minInd;
        } else {
            i = Math.floor(Math.random()*targets.length);
        }

        console.log(`minInd is ${minInd} and chosen is ${i}`);
    }

    proxyServer.web(req, res, {target: targets[i]});
}).listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
