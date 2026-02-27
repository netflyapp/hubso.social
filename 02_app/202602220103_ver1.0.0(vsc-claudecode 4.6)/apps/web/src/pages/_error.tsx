import { NextPageContext } from 'next'

/**
 * Custom error page for Pages Router compatibility.
 * Required to fix Next.js 15 standalone build bug where
 * internal _error page imports Html from next/document.
 * Actual error handling is done by App Router's error.tsx files.
 */
function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#e2e8f0', margin: 0 }}>
        {statusCode}
      </h1>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
        {statusCode === 404 ? 'Strona nie istnieje' : 'Wystąpił błąd serwera'}
      </p>
      <a
        href="/"
        style={{
          marginTop: '1.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#4f46e5',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}
      >
        Strona główna
      </a>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
