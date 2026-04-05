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
    const supabase = getSupabase()
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Proceed directly to upload since the bucket is known to exist

    const uploadedUrls: string[] = []

    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}_${i}.${fileExt}`
      const filePath = `products/${fileName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        // Give a clear actionable message if the bucket is the problem
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error(
            `Storage bucket "${BUCKET_NAME}" not found. Please create it:\n` +
            `1. Go to your Supabase Dashboard → Storage\n` +
            `2. Click "New Bucket"\n` +
            `3. Name it: ${BUCKET_NAME}\n` +
            `4. Toggle "Public bucket" ON\n` +
            `5. Click "Create bucket"\n` +
            `Then try uploading again.`
          )
        }
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({ success: true, urls: uploadedUrls })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
