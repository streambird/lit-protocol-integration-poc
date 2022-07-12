import LitJsSdk from "lit-js-sdk/build/index.node.js";
import fs from "fs";
import { serialize, recoverAddress } from "@ethersproject/transactions";
import {
  hexlify,
  splitSignature,
  hexZeroPad,
  joinSignature,
} from "@ethersproject/bytes";
import { recoverPublicKey, computePublicKey } from "@ethersproject/signing-key";
import { ethers } from "ethers";
import keccak256 from "keccak256"
import Web3 from "web3";

// this code will be run on the node
const litActionCode = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, keyId, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, keyId , sigName });
};

go();
`;


// you need an AuthSig to auth with the nodes
// normally you would obtain an AuthSig by calling LitJsSdk.checkAndSignAuthMessage({chain})
const authSig = {
  sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
  derivedVia: "web3.eth.personal.sign",
  signedMessage:
    "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
  address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
};

const go = async () => {
  const provider = new ethers.providers.InfuraProvider("rinkeby", "03193ed3c64a4ef6973a1a0300b16eb9");

  const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
  await litNodeClient.connect();

  let gasPrice = await provider.send("eth_gasPrice")

  const txParams = {
    gasPrice: gasPrice,
    gasLimit: "0x" + (30000).toString(16),
    to: "0x35aB7b80404Df4C07bcA5db9bb2F916ed9BC8B21",
    value: ethers.utils.parseUnits("0.000000000001", "ether"),
    chainId: 4
  };

  console.log('gasPrice', gasPrice)
  console.log('parseIntgasPrice', Web3.utils.toDecimal(gasPrice))
  console.log('vaue', ethers.utils.parseUnits("0.000000000001", "ether").toNumber())

  let price = Web3.utils.toDecimal(gasPrice) * ethers.utils.parseUnits("0.000000000001", "ether").toNumber();
  console.log('gasPricegasPricegasPrice', price)

  var txParamsBuffer = Buffer.from(JSON.stringify(txParams))
  const msgArr = [...keccak256(txParamsBuffer)];

  console.log('msgArr', msgArr)

  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    jsParams: {
      toSign: msgArr,
      keyId: "1",
      sigName: "tim",
    },
    authSig,
  });
  console.log("signatures: ", signatures);
  const sig = signatures.tim;
  const dataSigned = "0x" + sig.dataSigned;
  const encodedSig = joinSignature({
    r: "0x" + sig.r,
    s: "0x" + sig.s,
    v: sig.recid,
  });

  console.log("encodedSig", encodedSig);
  console.log("sig length in bytes: ", encodedSig.substring(2).length / 2);
  console.log("dataSigned", dataSigned);
  const splitSig = splitSignature(encodedSig);
  console.log("splitSig", splitSig);

  const recoveredPubkey = recoverPublicKey(dataSigned, encodedSig);
  console.log("uncompressed recoveredPubkey", recoveredPubkey);
  const compressedRecoveredPubkey = computePublicKey(recoveredPubkey, true);
  console.log("compressed recoveredPubkey", compressedRecoveredPubkey);
  const recoveredAddress = recoverAddress(dataSigned, encodedSig);
  console.log("recoveredAddress", recoveredAddress);

  // const txParams = {
  //   nonce: "0x0",
  //   gasPrice: "0x2e90edd000", // 200 gwei
  //   gasLimit: "0x" + (30000).toString(16), // 30k gas limit should be enough.  only need 21k to send.
  //   to: "0x50e2dac5e78B5905CB09495547452cEE64426db2",
  //   value: "0x" + (10000).toString(16),
  //   chainId,
  // };

  const txn = serialize(txParams, encodedSig);

  console.log("txn", txn);

  const txnHash = await provider.send("eth_sendRawTransaction", [txn]);

  console.log('txnHash', txnHash)
};

go();