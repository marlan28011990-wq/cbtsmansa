import { createContext, useContext, useMemo, useState } from 'react'
import { db } from '../db/db.js'
import { hashPassword } from '../utils/auth.js'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cbt-session') || 'null'))
  async function login(username, password) {
    const identity = username.trim()
    let account = await db.users.where('username').equals(identity).first()
    if (!account && identity.includes('@')) {
      const teacher = await db.guru.where('email').equals(identity.toLowerCase()).first()
      if (teacher) account = await db.users.where('guruId').equals(teacher.id).first()
    }
    if (!account || account.passwordHash !== await hashPassword(password)) throw new Error('Nama pengguna atau kata sandi salah.')
    const safe = { id: account.id, username: account.username, role: account.role, nama: account.nama, guruId: account.guruId }
    localStorage.setItem('cbt-session', JSON.stringify(safe)); setUser(safe); return safe
  }
  function logout() { localStorage.removeItem('cbt-session'); setUser(null) }
  const value = useMemo(() => ({ user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
