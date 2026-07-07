import '../styles/globals.css'
import { AuthProvider } from '../components/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'

// Pages that don't require authentication
const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password']

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)

  return (
    <AuthProvider>
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}

export default MyApp