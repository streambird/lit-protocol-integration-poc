import {
  SignTypedDataVersion,
  recoverTypedSignature,
  typedSignatureHash,
} from "@metamask/eth-sig-util";
// import { _typedSignatureHash } from "./eth-signing-methods";
import { LitProtocolUtils } from "./lit-protocol-utils";
import { recoverAddress, recoverPublicKey } from "ethers/lib/utils";
import LitJsSdk from "lit-js-sdk";
// import ethers from "ethers";

const litProtocol = new LitProtocolUtils();

export const litProtocolSignTypedDataV1 = async (message: any) => {
  try {
    await litProtocol.connected;
    // According to metamask util here https://github.com/MetaMask/eth-sig-util/blob/cde38f7aa3f8e8d0a7ee75730f363325b8e1924c/src/sign-typed-data.ts#L516
    // the signatureHash is passed to:
    // ecsign -> ecdsaSign(msgHash, privateKey) https://github.com/ethereumjs/ethereumjs-util/blob/master/src/signature.ts#L26
    console.log("Hashing message", message);
    const msgHashHex = typedSignatureHash(message);
    const msgHash = Array.from(
      LitJsSdk.uint8arrayFromString(msgHashHex.replace("0x", ""), "base16")
    );

    const signatures = await litProtocol.executeJS(msgHash);
    const { encodedSignature, messageHash } = litProtocol.encodeSignature(
      signatures.data
    );

    console.log("msgHash", msgHash);
    console.log("msgHashHex", msgHashHex);
    console.log("messageHash", messageHash);

    const recoveredPubkey = recoverPublicKey(messageHash, encodedSignature);
    const recoveredAddress = recoverAddress(messageHash, encodedSignature);
    console.log("recovering typed sig for data: ", message);
    console.log("recoveredPubkey:", recoveredPubkey);
    console.log("recoveredAddress:", recoveredAddress);
    const recoverTypedDataAddress = recoverTypedSignature({
      data: message,
      signature: encodedSignature,
      version: "V1" as SignTypedDataVersion,
    });
    console.log("recoverTypedDataAddress:", recoverTypedDataAddress);
    console.log("encodedSignature: ", encodedSignature);
  } catch (error) {
    console.log("error: ", error);
  }
};
