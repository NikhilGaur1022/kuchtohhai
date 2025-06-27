import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  const { data, error } = await client.from('articles').select('*')

  if (error) {
    console.error('❌ Error fetching articles:', error)
  } else {
    console.log('✅ Articles fetched:', data)
  }
}

main()
