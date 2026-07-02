// Reset Password Page — GOAT Royalty App
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      // Supabase password reset integration point
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess('Password updated successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError('Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '#555', width: '0%' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '20%' }
    if (score <= 2) return { label: 'Fair', color: '#f59e0b', width: '40%' }
    if (score <= 3) return { label: 'Good', color: '#3b82f6', width: '65%' }
    if (score <= 4) return { label: 'Strong', color: '#10b981', width: '85%' }
    return { label: 'Very Strong', color: '#8b5cf6', width: '100%' }
  }

  const strength = getPasswordStrength(password)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2rem'
          }}>🐐</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Set New Password
          </h1>
          <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Choose a strong password for your account
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
          }}>
            <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#10b981', fontSize: '0.875rem', margin: 0 }}>{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ color: '#ccc', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.75rem',
                    padding: '0.875rem 3rem 0.875rem 2.75rem', color: '#fff',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s', borderRadius: '2px' }} />
                  </div>
                  <p style={{ color: strength.color, fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#ccc', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#888" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '0.75rem', padding: '0.875rem 3rem 0.875rem 2.75rem',
                    color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                border: 'none', borderRadius: '0.75rem', padding: '0.875rem',
                color: '#fff', fontSize: '1rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {loading ? (
                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Updating Password...</>
              ) : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => router.push('/login')}
            style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #555; }
        input:focus { border-color: rgba(139,92,246,0.5) !important; }
      `}</style>
    </div>
  )
}