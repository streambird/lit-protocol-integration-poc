import { litProtocolSignTypedDataV1 } from './signTypedTx'
// import fetch from 'node-fetch'
// (globalThis as any).fetch = fetch

const go = async () => {
    // TODO(JL): 
    // 1. check this example code to make sure it looks right
    // 2. setup typescript env so we can just runDemo.ts
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