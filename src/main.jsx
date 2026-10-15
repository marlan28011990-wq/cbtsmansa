import React from 'react'
import { createRoot } from 'react-dom/client'
import { seedDatabase } from './db/seed.js'
import { ensureCurriculumSubjects } from './db/curriculum.js'
import { ensureDefaultClasses } from './db/classes.js'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles.css'

seedDatabase()
  .then(() => ensureCurriculumSubjects())
  .then(() => ensureDefaultClasses())
  .catch((error) => console.error('Gagal menyiapkan data contoh CBT:', error))
  .finally(() => createRoot(document.getElementById('root')).render(<React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>))
