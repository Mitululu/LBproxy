// Video stream load balancer with decision based on
// UCB1 reinforcement learning algorithm with
// video server response time as the metric.

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

let choicecount = 3, initial_explore = 5;

if(choicecount > targets.length - 1){
    choicecount = targets.length - 1;
}

let target_times = [], avg_times = [], initialize = true;
let time_count = 0, maxcount = initial_explore * targets.length;
let i = -1; // current target index
let choosable = new Set(), chosens = [];

for(let j = 0; j < targets.length; j++){
    target_times.push([]);
    avg_times.push(0)
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

                if(j < choicecount) choosable.add(j);
                else chosens.push(j);
            }
        }
    } else {
        oldtime = target_times[i].shift();
        avg_times[i] += (rtime - oldtime) / initial_explore;
        
        choosable.delete(i);
        chosens.push(i);
        choosable.add(chosens.shift());
    }
    // console.log(`Target index ${i} (${targets[i]}) had a response time of ${avg_times[i]} ms`);
});


http.createServer((req, res) => {
    if(initialize){
        i = (i + 1) % targets.length;
    } else {
        let minInd = -1;
        for(let index of choosable){
            if(minInd == -1){
                minInd = index; 
            }else if(avg_times[index] < avg_times[minInd]){
                minInd = index;
            }
        }
        i = minInd;
        console.log(`choices are ${choosable} and chosen is ${i}`);
    }

    proxyServer.web(req, res, {target: targets[i]});
}).listen(3000, () => {
    console.log('Proxy server running on port 3000')
});
