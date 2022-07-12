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
import jssha3 from 'js-sha3';

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


const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"FreeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"activateMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"contractURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deactivateMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"discountPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"freeMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"}],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hideTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxPerTxn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mintActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"numberMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_operator","type":"address"},{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"qty","type":"uint256"}],"name":"ownerMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pricePublic","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"qty","type":"uint256"}],"name":"publicMint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reservedTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"revealTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sendOnContract","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"setDiscountPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"numTokens","type":"uint256"}],"name":"setTotalTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]

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

  // let gasPrice = await provider.send("eth_gasPrice")

  // console.log(`gas price: ${gasPrice}`)

  // const txParams = {
  //   // gasPrice: gasPrice, 
  //   // gasLimit: "0x" + (300000).toString(16),

  //   // 1.100 gwei
  //   // GAS LIMIT30000000 gas
  //   gasPrice: ethers.utils.parseUnits("1.1", "gwei"),
  //   gasLimit: 30000000,
  //   to: "0x35aB7b80404Df4C07bcA5db9bb2F916ed9BC8B21",
  //   value: ethers.utils.parseUnits("0.0001", "ether"),
  //   chainId: 4
  // };

  // const contract = new ethers.Contract('0x83CDAeF1De9EF3A9BF86DD2dbbEde72087D96F71', abi, provider)
  // console.log(contract)
  // const res = contract.contractURI()
  // console.log(res)

  // const txParams = { 
  //   gasPrice: ethers.utils.parseUnits("1.1", "gwei"),
  //   gasLimit: 30000000,
  //   to: "0x35aB7b80404Df4C07bcA5db9bb2F916ed9BC8B21",
  //   // value: ethers.utils.parseEther("0.0")
  // }

  var getNonce = async (ethAddress) => {
    const url = "https://rinkeby.infura.io/v3/03193ed3c64a4ef6973a1a0300b16eb9";
    const data = {
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [ethAddress, "latest"],
      id: 1
    };
    const nonceResp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then((response) => response.json()).catch((error) => {
      console.error("Error:", error);
    });
    return nonceResp.result;
  };

  const fromAddress = "0x068C81b90F19Be1c7b16447f0E271B11f8915324";
   const nonce = await getNonce(fromAddress);
   console.log("latest nonce: ", nonce);

   // const txParams = {
   //   nonce: "0x0",
   //   gasPrice: "0x2e90edd000",
   //   gasLimit: "0x" + 3e4 .toString(16),
   //   to: "0x50e2dac5e78B5905CB09495547452cEE64426db2",
   //   value: "0x" + 1e4 .toString(16),
   //   chainId: 137
   // };


  const txParams = {
    nonce: nonce,
    gasPrice: ethers.utils.parseUnits("1.1", "gwei"),
    gasLimit: 30000,
    to: "0x35aB7b80404Df4C07bcA5db9bb2F916ed9BC8B21",
    value: ethers.utils.parseEther("0.000001"),
    chainId: 4,
  };

  // console.log('\n\n\n\n')
  // console.log(txParams)
  // console.log('\n\n\n\n')

  
  // const wallet = new ethers.Wallet(pkey, provider)
  // const res = await wallet.sendTransaction(txParams)
  // console.log('\n\n\n\n')
  // console.log(res)
  // console.log('\n\n\n\n')
  

  // // const txParams = {
  // //   to: "0x83CDAeF1De9EF3A9BF86DD2dbbEde72087D96F71",
  // //   chainId: 4, 

  // // }

  // console.log('gasPrice', gasPrice)
  // console.log('parseIntgasPrice', Web3.utils.toDecimal(gasPrice))
  // console.log('vaue', ethers.utils.parseUnits("0.000000000001", "ether").toNumber())

  // let price = Web3.utils.toDecimal(gasPrice) * ethers.utils.parseUnits("0.000000000001", "ether").toNumber();
  // console.log('gasPricegasPricegasPrice', price)

  // var txParamsBuffer = Buffer.from(JSON.stringify(txParams))
  // const msgArr = [...keccak256(txParamsBuffer)];

  // const msgArr = txParams

  // console.log('msgArr', msgArr)

  const serializedTx = ethers.utils.serializeTransaction(txParams)
  console.log("serializedTx", serializedTx);

  const rlpEncodedTxn = ethers.utils.arrayify(serializedTx);
  console.log("rlpEncodedTxn: ", rlpEncodedTxn);
  

  const unsignedTxn = jssha3.keccak256.digest(rlpEncodedTxn);
  console.log("unsignedTxn: ", unsignedTxn);
  
  const toSign = unsignedTxn;

  console.log(`\n\n\n\n\n\n\n`)
  console.log(toSign)
  console.log(`\n\n\n\n\n\n\n`)

  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    jsParams: {
      toSign:  toSign,
      keyId: "1",
      sigName: "tim",
    },
    authSig,
  });
  // console.log("signatures: ", signatures);
  const sig = signatures.tim;
  const dataSigned = "0x" + sig.dataSigned;
  const encodedSig = joinSignature({
    r: "0x" + sig.r,
    s: "0x" + sig.s,
    v: sig.recid,
  });

  // console.log("encodedSig", encodedSig);
  // console.log("sig length in bytes: ", encodedSig.substring(2).length / 2);
  // console.log("dataSigned", dataSigned);
  // const splitSig = splitSignature(encodedSig);
  // console.log("splitSig", splitSig);

  const recoveredPubkey = recoverPublicKey(dataSigned, encodedSig);
  // console.log("uncompressed recoveredPubkey", recoveredPubkey);
  const compressedRecoveredPubkey = computePublicKey(recoveredPubkey, true);
  // console.log("compressed recoveredPubkey", compressedRecoveredPubkey);
  const recoveredAddress = recoverAddress(dataSigned, encodedSig);
  console.log("recoveredAddress", recoveredAddress);

  // // const txParams = {
  // //   nonce: "0x0",
  // //   gasPrice: "0x2e90edd000", // 200 gwei
  // //   gasLimit: "0x" + (30000).toString(16), // 30k gas limit should be enough.  only need 21k to send.
  // //   to: "0x50e2dac5e78B5905CB09495547452cEE64426db2",
  // //   value: "0x" + (10000).toString(16),
  // //   chainId,
  // // };

  const txn = serialize(txParams, encodedSig);

  console.log("txn", txn);

  const txnHash = await provider.send("eth_sendRawTransaction", [txn]);

  console.log('txnHash', txnHash)
};

go();