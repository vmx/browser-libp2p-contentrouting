const CID = require('cids')
const IPFS = require('ipfs')
const { multicodec, multihash } = require('ipfs/src')

const roomCid = (room) => {
  const enc = new TextEncoder();
  const myCid = new CID(1, multicodec.IDENTITY, multihash.encode(enc.encode(room), 'identity'))
  return myCid;
}

const onLoad = async () => {
  const nodeInit = IPFS.create({
    repo: '/tmp/chatapp',
    libp2p: {
      config: {
        dht: {
          enabled: true
        },
        pubsub: {
          enabled: true
        }
      }
    }
  })

  const node = await nodeInit
  console.log('vmx: ipfs version:', await node.version())

  let myCid = roomCid("vmxmycoolroom")

  await node.libp2p.contentRouting.provide(myCid)
  console.log('vmx: cid was provided:', myCid)
  for await (const provider of node.libp2p.contentRouting.findProviders(myCid)) {
    console.log('vmx: providers of the room:', provider.id.toString())
  }
}

window.addEventListener('load', onLoad);
