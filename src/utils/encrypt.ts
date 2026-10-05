import CryptoJS from "crypto-js"

export const encryptToken = (
  difficultyId: string,
  userId: string,
  secretPhraze: string,
) => {
  const encoder = new TextEncoder()

  const paddedUserIdBytes = encoder.encode(userId.padStart(24, "0"))
  const difficultyIdBytes = encoder.encode(difficultyId)
  const secretPhrazeBytes = encoder.encode(secretPhraze)

  const userIdByteArray = CryptoJS.lib.WordArray.create(paddedUserIdBytes)
  const difficultyIdByteArray = CryptoJS.lib.WordArray.create(difficultyIdBytes)
  const secretPhrazeByteArray = CryptoJS.lib.WordArray.create(secretPhrazeBytes)

  const encryptedDifficultyId = CryptoJS.AES.encrypt(
    difficultyIdByteArray,
    userIdByteArray,
    {
      mode: CryptoJS.mode.ECB,
    },
  )

  const encryptedToken = CryptoJS.AES.encrypt(
    encryptedDifficultyId.ciphertext,
    secretPhrazeByteArray,
    {
      mode: CryptoJS.mode.ECB,
    },
  )

  return encryptedToken.toString()
}

export const encryptWord = (data: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(data, secretKey).toString()
}

export const decryptWord = (
  encryptedData: string,
  secretKey: string,
): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

