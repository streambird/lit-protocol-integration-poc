import { litProtocolSignTypedDataV1 } from './signTypedTx'

const go = async () => {
    // TODO(JL): add example typedV1 message here for sandbox.
    const message = {}
    await litProtocolSignTypedDataV1(message);

}

go()