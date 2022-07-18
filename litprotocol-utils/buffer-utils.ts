import { toBuffer } from 'ethereumjs-util'
import { isHexString } from 'ethjs-util'

export function legacyToBuffer(value: any) {
  return typeof value === 'string' && !isHexString(value)
      ? Buffer.from(value)
      : toBuffer(value);
}