import { litProtocolSignTypedDataV1 } from './signTypedTx'

const go = async () => {
    // TODO(JL): check this example code to make sure it looks right
    const message = [
    {
        type: 'string',
        name: 'fullName',
        value: 'John Doe',
        
    }, 
    {
        type: 'uint32',
        name: 'userId',
            value: '1234',
    }];
    await litProtocolSignTypedDataV1(message);
}

go()