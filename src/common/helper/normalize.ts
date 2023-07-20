export function NormalizeKeyword(inputString: string) {
  return inputString.replace(/[^\p{L}\p{N}]/gu, '').toUpperCase()
}
