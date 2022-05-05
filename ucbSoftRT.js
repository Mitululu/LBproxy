// Video stream load balancer with decision based closely
// on UCB1 reinforcement learning algorithm with
// video server response time as the metric.
// Has an softly increasing chance of exploration (soft)

const http = require('http');
const proxy = require('http-proxy');

const targets = [
    'http://localhost:8000',
    'http://localhost:8001'
];

let cons_add = 10, initial_explore = 3;
// cons_add is a specific value each server's metric is worsened by
//     each time the server is chosen (choose it less often for exploration)
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
        // console.log("initialize step");
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
        avg_times[i] += cons_add;

        // console.log(`New avg time at index ${i} is ${avg_times[i]}`)
        for(let j = 0; j < avg_times.length; j++){
            if(avg_times[j] < avg_times[minInd]) minInd = j;
        }
    }
    // console.log(`Target index ${i} (${targets[i]}) had a response time of ${avg_times[i]} ms`);
});

// RandomLB target index: Math.floor(Math.random()*3)

http.createServer((req, res) => {
    if(initialize){
        i = (i + 1) % targets.length;
    } else {
        i = minInd;
        // console.log(`minInd is ${minInd} and chosen is ${i}`);
    }

    proxyServer.web(req, res, {target: targets[i]});
}).listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
