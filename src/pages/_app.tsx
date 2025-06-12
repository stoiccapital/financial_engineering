import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from '@/components/Layout/Layout'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Missing required environment variables')
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Configuration Error
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>Financial Engineering</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
} 