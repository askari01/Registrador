
const crypto = require('crypto');
const Swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const getPort = require('get-port');
const readline = require('readline');
const io = require('socket.io')();
const fs  = require("fs");
const async = require("async");

const {blockVerify} = require("./blockVerify");   
const peers = {}
// Counter for connections, used to identify connections
let connSeq = 0

// Peer Identity, a random hash for identify your peer
const myId = crypto.randomBytes(32)
console.log('Your identity: ' + myId.toString('hex'))

// reference to redline interface
let rl
var a =5;
function log () {
  if (rl) {
    rl.clearLine()
    rl.close()
    rl = undefined
  }
  for (let i = 0, len = arguments.length; i < len; i++) {
    console.log(arguments[i])
  }

}

/** 
 * Default DNS and DHT servers
 * This servers are used for peer discovery and establishing connection
 */
const config = defaults({
  // peer-id
  id: myId,
})

/**
 * discovery-swarm library establishes a TCP p2p connection and uses
 * discovery-channel library for peer discovery
 */                  var i = 0;

    
const sw = Swarm(config)


;(async () => {

  const port = await getPort()
  sw.listen(port)
  console.log('Listening to port: ' + port)
  
  var lastHeight = 568;
  const port2 = await getPort();
io.listen(port2);
console.log('listening on port ', port2);

io.on('connection', (client) => {
  client.on('sendTransaction', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
    for (let id in peers) {
 peers[id].conn.write(JSON.stringify({"text" : interval, "me" : myId.toString("hex")},undefined,2))    }  
  });
});
  /**
   * The channel we are connecting to.
   * Peers should discover other peers in this channel
   */
await sw.join('rohandhoot')

  sw.on('connection', (conn, info) => {
    // Connection id
    async.whilst(
  function () {return Boolean(fs.readFileSync("./clients/GovernmentNode/boolean.log").toString())},
  function (callback){
    
    setTimeout(callback, 1000);
    var block = JSON.parse(fs.readFileSync("./clients/GovernmentNode/block.json").toString())
    if(!block.header){
      fs.writeFileSync("./clients/GovernmentNode/boolean.log","");
    }
    else{
    if(new Date().getMinutes() === 49 && new Date().getSeconds() === 0){
      if(lastHeight + 1 === block.header.blockHeight){
        console.log("dhun dhun dhun 143");
        var count = 0;
        for (let id in peers) {
          peers[id].conn.write(JSON.stringify(block,undefined,2))
        }
        fs.writeFileSync("./clients/GovernmentNode/block.json",JSON.stringify({},undefined,2));
        fs.writeFileSync("./clients/GovernmentNode/boolean.log","");
      }          
    }}
  },
  function (){
    fs.writeFileSync("./clients/GovernmentNode/boolean.log","true");
  }
)
    //fs.writeFileSync("./clients/GovernmentNode/boolean.log","true");

    const seq = connSeq
    const peerId = info.id.toString('hex')
    log(`Connected #${seq} to peer: ${peerId}`)

    // Keep alive TCP connection with peer
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600)
      } catch (exception) {
        log('exception', exception)
      }
    }
    console.log("dont")
    conn.on('data', data => {

      // Here we handle incomming messages
      log(
        'Received Message from peer ' + peerId,
        '----> ' + data.toString()
      )

      blockVerify(data, (reply) => {
        console.log(reply);
      });
      io.emit('getTransaction', data.toString());
      a++;
    })

    conn.on('close', () => {
      // Here we handle peer disconnection
      log(`Connection ${seq} closed, peer id: ${peerId}`)
      // If the closing connection is the last connection with the peer, removes the peer
      if (peers[peerId].seq === seq) {
        delete peers[peerId]
      }
    })

    // Save the connection
    if (!peers[peerId]) {
      peers[peerId] = {}
    }
    peers[peerId].conn = conn
    peers[peerId].seq = seq
    connSeq++

  })

  //send(a)  
                for (let id in peers) {
 peers[id].conn.write(JSON.stringify({"text" : "lol", "me" : myId.toString("hex")},undefined,2))    }

})()

