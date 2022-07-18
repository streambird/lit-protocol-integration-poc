import MetamaskSignUtil, { typedSignatureHash, recoverTypedSignature } from '@metamask/eth-sig-util'
import { LitProtocolUtils } from './lit-protocol-utils'
import { recoverAddress, recoverPublicKey } from 'ethers/lib/utils'

export const litProtocolSignTypedDataV1 = async (message: any) => {
    try {
        const litProtocol = LitProtocolUtils;
        // const [message] = payload.params
        const signatureHash = typedSignatureHash(message)
        console.log('signatureHash:', signatureHash)
        const keccak256Hash = litProtocol.getKeccak256Hash(signatureHash)
        console.log('keccak256Hash:',keccak256Hash)
        const signatures = await litProtocol.executeJS(keccak256Hash)
        const { encodedSignature, messageHash } = litProtocol.encodeSignature(signatures.data)
        const recoveredPubkey = recoverPublicKey(messageHash, encodedSignature)
        const recoveredAddress = recoverAddress(messageHash, encodedSignature)
        console.log('recoveredPubkey:',recoveredPubkey)
        console.log('recoveredAddress:',recoveredAddress)
        const recoverTypedData = recoverTypedSignature({
            data: message,
            signature: encodedSignature,
            version: 'V1' as MetamaskSignUtil.SignTypedDataVersion
        })
        console.log('recoverTypedData:',recoverTypedData)
        console.log("encodedSignature: ", encodedSignature)
    } catch(error) {
        console.log("error: ", error)
    }           
}