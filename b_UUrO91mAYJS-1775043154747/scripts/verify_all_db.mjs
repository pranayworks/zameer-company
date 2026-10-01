import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziuqzoqwkbtpjbleoibj.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mmGLuziB99Tw2hI2AsPqSg_OPfwqgRE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testAllDatabaseTables() {
  console.log("🔍 Checking Database Architecture & Connectivity...\n")

  const tables = ['products', 'orders', 'profiles', 'users']

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        console.log(`❌ Table '${table}': Error -> ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': Connected successfully (Total Records: ${count ?? 0})`)
      }
    } catch (e) {
      console.log(`❌ Table '${table}': Exception -> ${e.message}`)
    }
  }

  // Fetch sample products to confirm payload integrity
  console.log("\n📦 Fetching Sample Products from Cloud Database:")
  const { data: sampleProducts } = await supabase.from('products').select('id, title, category, price, stock').limit(5)
  console.table(sampleProducts)

  console.log("\n🎉 Database Verification Finished Cleanly!")
}

testAllDatabaseTables()
