import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziuqzoqwkbtpjbleoibj.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mmGLuziB99Tw2hI2AsPqSg_OPfwqgRE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const removedIds = [
  'temple-pillar-heavyweight-tee',
  'archival-french-terry-hoodie',
  'raw-sand-cargo-trouser',
  'short-kurta-chudidhar-set'
]

async function purge() {
  console.log("🗑️ Purging target removed products from Supabase database...")
  const { data, error } = await supabase
    .from('products')
    .delete()
    .in('id', removedIds)

  if (error) {
    console.error("❌ Failed to purge items from database:", error.message)
  } else {
    console.log("✅ Successfully purged target products from Supabase!")
  }
}

purge()
