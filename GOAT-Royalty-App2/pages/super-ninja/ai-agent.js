// Super Ninja AI Agent — redirects to OpenClaw AI
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SuperNinjaAIAgent() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/openclaw')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🥷</div>
        <p style={{ color: '#888' }}>Loading Super Ninja AI Agent...</p>
      </div>
    </div>
  )
}