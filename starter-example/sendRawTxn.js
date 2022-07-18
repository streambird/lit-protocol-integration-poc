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


const go = async () => {
  const provider = new ethers.providers.InfuraProvider("rinkeby", "03193ed3c64a4ef6973a1a0300b16eb9");
  // const CHAIN_ID = 4; // 4 = infura rinkeby
  const txn = "0xf8680f82520882753094bc3dd9bf0425f9985b641d4314b5dc30bf75a63487038d7ea4c68000801ca049ccee4c68a0dcddcd7336dcb697a56310e4da3d4e567cc29f3f3044e7c7e9b2a04a948cff6dfd5899d5b4d06bd0ab1c680c3cd8952be53f08e25f59569d0d1b87";
  console.log("txn", txn);
  const txnHash = await provider.send("eth_sendRawTransaction", [txn]);
  console.log('txnHash', txnHash)
};

go();