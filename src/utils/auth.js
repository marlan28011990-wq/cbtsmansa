export async function hashPassword(value) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, '0')).join('')
}
