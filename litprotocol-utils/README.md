### Streambird LitProtocol Utils Demo

#### Setup

```
yarn
yarn run demo
```

We are trying to re-implement the `signTypedData_v1` using Lit. But so far cannot the recoverTypedDataAddress to recover the proper public address since our encoding/serialization but the signer might have been wrong.

Some npm code we referenced:

```
https://github.com/ethereum/js-ethereum-cryptography/blob/30691a4992dacb860e19413e99110dd1274497b7/src/secp256k1-compat.ts#L95
https://github.com/MetaMask/eth-sig-util/blob/cde38f7aa3f8e8d0a7ee75730f363325b8e1924c/src/sign-typed-data.ts#L509
```