const CID = require('cids')
const IPFS = require('ipfs')
const { multicodec, multihash } = require('ipfs/src')
const WS = require('libp2p-websockets')
const filters = require('libp2p-websockets/src/filters')

const transportKey = WS.prototype[Symbol.toStringTag]

const roomCid = (room) => {
  const enc = new TextEncoder();
  const myCid = new CID(1, multicodec.IDENTITY, multihash.encode(enc.encode(room), 'identity'))
  return myCid;
}

const onLoad = async () => {
  const $button = document.querySelector('button')

  const nodeInit = IPFS.create({
    repo: '/tmp/chatapp5',
    libp2p: {
     config: {
       dht: {
         enabled: true
       },
       pubsub: {
         enabled: true
       },
       transport: {
        // This is added for local demo!
        // In a production environment the default filter should be used
        // where only DNS + WSS addresses will be dialed by websockets in the browser.
        [transportKey]: {
          filter: filters.all
        }
       }
      }
    },
    relay: {
      enabled: true, // enable relay dialer/listener (STOP)
      hop: {
        enabled: true // make this node a relay (HOP)
      }
    },
    config: {
      Bootstrap: []
    }
  })

  const node = await nodeInit
  console.log('vmx: ipfs version5:', await node.version())

  // Connect to a relay node so that Browser instances can talk to each other.
  const relayPeer = '/ip4/127.0.0.1/tcp/15003/ws/p2p/12D3KooWPmPb9UBSNuJwoCPU8X7qz4CqT5BxAu1JawxZFUW8FTc9'
  await node.swarm.connect(relayPeer)
  const identity = await node.id()
  console.log('vmx: identity after swarm connect is:', identity)


  const peers = await node.swarm.peers()
  console.log('vmx: peers:', peers)

  //const myCid = roomCid("vmxmycoolroom")
  const resultAdd = await node.add('vmxmycoolroom')
  console.log('vmx: result add:', resultAdd)
  const myCid = resultAdd.cid;

  // Try to provide the romm CID, so that we can find everyone who is providing it
  await node.libp2p.contentRouting.provide(myCid)
  console.log('vmx: cid was provided:', myCid)

  //// Subscribe to the room via pubsub
  //await node.pubsub.subscribe(myCid.toString(), (msg) => {
  //    console.log('vmx: got this pubsub message:', msg)
  //})


  //// Do a hard-coded connection between two peers via a circuit relay
  //const firstPeer = 'QmSMNPZk5FFUye2Yfe4XiHn4WVLSehwGww8QNFSdr1587k'
  //const secondPeer = 'QmNr2c2H6Kw2h4maMfVqXyYPfrqQ2C5KcTf3okiF8LY3zp'
  //if (identity.id == secondPeer) {
  //  console.log('vmx: connect this peer to', secondPeer)
  //  await node.swarm.connect(relayPeer + '/p2p-circuit/p2p/' + firstPeer)
  //}



  $button.addEventListener('click', async () => {
    // List peers we are currently connected to
    const peers = await node.swarm.peers()
    console.log('vmx: peers connected to: ', peers)

    // List all providers of `myCid`
    for await (const provider of node.libp2p.contentRouting.findProviders(myCid)) {
      console.log('vmx: providers of the room:', provider.id.toString())
    }

    //// List all peers subscribed to the room via pubsub
    //const pubsubPeers = await node.pubsub.peers(myCid.toString())
    //console.log('vmx: peers that are subscribed via pubsub to the room:', pubsubPeers)
    //
    //// Send something over pubsub
    //const ping = await node.pubsub.publish(myCid.toString(), "ping")
  })


}

window.addEventListener('load', onLoad);
