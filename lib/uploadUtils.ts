// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export async function uploadToCloudinaryPdf(file: File, folder = 'resumes') {
//   if (
//     file.type !== 'application/pdf' ||
//     !file.name.toLowerCase().endsWith('.pdf')
//   ) {
//     throw new Error('Only PDF files are allowed.');
//   }

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const baseName = file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
//   const savedFileName = `${baseName}-${Date.now()}.pdf`;

//   const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         public_id: savedFileName,
//         format: 'pdf',
//         resource_type: 'auto',
//       },
//       (err, result) => {
//         if (err || !result) return reject(err || new Error('Upload failed'));
//         resolve(result as { secure_url: string });
//       }
//     );
//     stream.end(buffer);
//   });

//   return result.secure_url;
// }




// File: app/api/Expences/upload/route.ts
// (New API route for handling file uploads to Cloudinary)
// This route receives FormData with 'file', uploads to Cloudinary, and returns the secure URL.

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = 'nodejs';

async function uploadToCloudinary(file: File, folder = 'expenses') {
  // Validate file type (allowing images and PDFs; you can add more types if needed)
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Only images (JPEG, PNG, GIF, WEBP) and PDFs are allowed.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate a unique file name while preserving extension
  const parts = file.name.split('.');
  const extension = parts.pop()?.toLowerCase() || '';
  const baseName = parts.join('.').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const savedFileName = `${baseName}-${Date.now()}`;

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: savedFileName,
        format: extension,
        resource_type: 'auto',
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve(result as { secure_url: string });
      }
    );
    stream.end(buffer);
  });

  return result.secure_url;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const url = await uploadToCloudinary(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
