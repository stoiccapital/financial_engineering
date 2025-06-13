import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  const { email, password } = req.body
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return res.status(401).json({ error: error.message })
  return res.status(200).json(data)
} 