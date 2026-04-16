import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET_NAME = 'product-images'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json()
    const supabase = getSupabase()
    
    const fileExt = fileName.split('.').pop()?.toLowerCase() || (fileType.includes('video') ? 'mp4' : 'jpg')
    const finalFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `products/${finalFileName}`

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath)

    if (error) {
      if (error.message?.includes('Bucket not found')) {
        return NextResponse.json({ 
          error: `Bucket "${BUCKET_NAME}" not found. Please create it in Supabase Storage with "Public" access.` 
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ 
      uploadUrl: data.signedUrl, 
      token: data.token, // Some versions might need this
      publicUrl: supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl
    })
  } catch (error: any) {
    console.error('Signed URL error:', error)
    return NextResponse.json({ error: error.message || 'Signature failed' }, { status: 500 })
  }
}
