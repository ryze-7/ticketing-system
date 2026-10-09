import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'

// scrypt ships with Node, so there is no native dependency to break on Vercel.
function scrypt(password: string, salt: Buffer, keylen: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, (err, key) => (err ? reject(err) : resolve(key))),
  )
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, 64)
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, salt, key] = stored.split('$')
  if (alg !== 'scrypt' || !salt || !key) return false
  const expected = Buffer.from(key, 'base64')
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

let dummy: Promise<string> | undefined
/** Verified against when the email is unknown, so login timing doesn't reveal which emails exist. */
export const dummyHash = () => (dummy ??= hashPassword('not-a-real-password'))
