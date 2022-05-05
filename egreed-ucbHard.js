// Video stream load balancer with decision based loosely
// on UCB1 reinforcement learning algorithm with
// video server response time as the metric.
// Every iteration has a guaranteed minimum level of exploration (hard)

const http = require('http');
const proxy = require('http-proxy');

const targets = [
    "http://34.201.76.76:8000/",
    "http://18.208.180.237:8000/",
    "http://54.197.21.48:8000/",
    "http://44.202.102.250:8000/",
    "http://44.202.82.37:8000/",
    "http://3.82.125.158:8000/",
    "http://3.92.178.80:8000/",
    "http://54.89.183.168:8000/",
    "http://18.212.168.69:8000/",
    "http://18.212.177.139:8000/",
    "http://52.90.114.26:8000/",
    "http://184.72.193.108:8000/"
];
// const targets = [
//     'http://localhost:8000',
//     'http://localhost:8001'
// ];

let choicecount = 6, initial_explore = 3;
let epsilon = 0.5, rri = -1;

if(choicecount > targets.length - 1){
    choicecount = targets.length - 1;
}

let target_times = [], avg_times = [], initialize = true;
let time_count = 0, maxcount = initial_explore * targets.length;
let i = -1, minInd = 0; // current target index
let choosable = new Set(), chosens = [];

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
        // console.log("initialize step")
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

        let roll = Math.random();
        let indices = Array.from(choosable)

        if(roll < epsilon){
            minInd = indices[0];
            for(let j = 1; j < indices.length; j++){
                let index = indices[j]
                if(avg_times[index] < avg_times[minInd]){
                    minInd = index;
                }
            }
        } else {
            rri = (rri + 1) % indices.length;
            minInd = indices[rri];
        }
        console.log(`Target index ${i} (${targets[i]}) had a response time of ${avg_times[i]} ms`);
        console.log(`choices are ${indices} and chosen is ${minInd}`);
    }
});


http.createServer((req, res) => {
    if(initialize){
        i = (i + 1) % targets.length;
    } else {
        i = minInd;
    }

    proxyServer.web(req, res, {target: targets[i]});
}).listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
