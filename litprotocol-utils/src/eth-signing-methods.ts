import { legacyToBuffer } from './buffer-utils';
import { soliditySHA3 } from 'ethereumjs-abi';
import { bufferToHex } from 'ethereumjs-util';

export function typedSignatureHash(typedData: any) {
  const hashBuffer = _typedSignatureHash(typedData);
  return bufferToHex(hashBuffer);
}

export function _typedSignatureHash(typedData: any) {
  const error = new Error('Expect argument to be non-empty array')
  if (typeof typedData !== 'object' ||
      !('length' in typedData) ||
      !typedData.length) {
      throw error
  }
  const data = typedData.map(function (e: any) {
      if (e.type !== 'bytes') {
          return e.value
      }
      return legacyToBuffer(e.value)
  })
  const types = typedData.map(function (e: any) {
      return e.type
  })
  const schema = typedData.map(function (e: any) {
      if (!e.name) {
          throw error
      }
      return `${e.type} ${e.name}`
  })
  return soliditySHA3(['bytes32', 'bytes32'], [
      soliditySHA3(new Array(typedData.length).fill('string'), schema),
      soliditySHA3(types, data),
  ])
}