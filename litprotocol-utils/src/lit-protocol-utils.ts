// @ts-ignore
import LitJsSdk from 'lit-js-sdk/build/index.node.js'
import { ethers } from "ethers"
import { joinSignature } from "@ethersproject/bytes"
import {
  serialize,
  recoverAddress
} from "@ethersproject/transactions"

import { recoverPublicKey, verifyMessage } from 'ethers/lib/utils'
import { keccak256 } from 'js-sha3'


const litActionCode = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, keyId, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message, keyId, sigName });
};
go();
`;

const authSig = {
  sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
  derivedVia: "web3.eth.personal.sign",
  signedMessage: "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
  address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
}


export const litProtocolPersonalSign = async (message: any) => {
  const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" })
  await litNodeClient.connect()
  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    jsParams: {
      message,
      keyId: '1',
      sigName: 'data',
    },
    authSig,
  })
  console.log('Message', message)
  const sig = signatures.data
  console.log('Signature', sig)
  const dataSigned = "0x" + sig.dataSigned
  const encodedSig = joinSignature({
    r: "0x" + sig.r,
    s: "0x" + sig.s,
    v: sig.recid,
  });

  console.log({ dataSigned, encodedSig })

  const recoveredPubkey = recoverPublicKey(dataSigned, encodedSig);
  console.log('recoveredPubkey', recoveredPubkey)

  const recoveredAddress = recoverAddress(dataSigned, encodedSig);
  console.log("recoveredAddress", recoveredAddress);

  const recoveredAddressViaMessage = verifyMessage(message, encodedSig);
  console.log("recoveredAddressViaMessage", recoveredAddressViaMessage);

  const ethersRecoveredMessage = ethers.utils.recoverAddress(dataSigned, encodedSig)
  console.log("ethersRecoveredMessage", ethersRecoveredMessage);


  return encodedSig
}

const LIT_PROTOCOL_ACTION_SIGN_ECDSA = `
const go = async () => {
  const sigShare = await LitActions.signEcdsa({ toSign, keyId , sigName });
};
go();
`

export class LitProtocolUtils {
  public connected: Promise<void>
  public client: LitJsSdk.LitNodeClient

  constructor() {
    this.client = new LitJsSdk.LitNodeClient({
      litNetwork: 'serrano'
    })
    this.connected = this.connect()
  }

  async connect() {
    await this.client.connect()
  }

  async executeJS(keccak256Hash: number[]) {
    const { signatures } = await this.client.executeJs({
      code: LIT_PROTOCOL_ACTION_SIGN_ECDSA,
      jsParams: {
        toSign: keccak256Hash,
        keyId: '1',
        sigName: 'data',
      },
      authSig,
    })
    return signatures
  }

  getKeccak256Hash(serialized: string) {
    const rlpEncoded = ethers.utils.arrayify(serialized)
    const keccak256Hash = keccak256.digest(rlpEncoded)
    return keccak256Hash
  }

  encodeSignature(signature: any) {
    const r = `0x${signature.r}`
    const s = `0x${signature.s}`
    const v = signature.recid
    const messageHash = `0x${signature.dataSigned}`
    const encodedSignature = joinSignature({
      r,
      s,
      v: signature.recid,
    })
    return {
      r,
      s,
      v: v? '0x1c' : '0x1b',
      encodedSignature,
      messageHash
    }
  }

  async signTransaction(transaction: any) {
    const tx = {
      ...transaction,
      gasLimit: transaction.gasLimit ?? transaction.gas
    }
    // Remove invalid fields for lit-protocol
    delete tx['gas']
    if (tx['from']) delete tx['from']
    // Map numbers to hexadecimal
    Object.keys(tx).forEach((key: string) => {
      const value = tx[key]
      if (['chainId'].includes(key)) {
        tx[key] = value
      } else {
        if (typeof value === 'number') {
          tx[key] = ethers.utils.hexlify(value)
        } else if (!isNaN(value)) {
          tx[key] = ethers.utils.isHexString(value) ? value : ethers.utils.hexlify(value)
        } else {
          tx[key] = value
        }
      }
    })
    const serialized = serialize(tx)
    const hash = this.getKeccak256Hash(serialized)
    const signatures = await this.executeJS(hash)
    const signature = signatures.data
    const {
      encodedSignature,
      messageHash,
      r,
      s,
      v
    } = this.encodeSignature(signature)
    const rawTransaction = serialize(tx, encodedSignature)
    return {
      messageHash,
      rawTransaction,
      r,
      s,
      v,
    }
  }
}