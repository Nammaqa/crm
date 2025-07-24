import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadToCloudinaryPdf(file: File, folder = 'resumes') {
  if (
    file.type !== 'application/pdf' ||
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    throw new Error('Only PDF files are allowed.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const baseName = file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const savedFileName = `${baseName}-${Date.now()}.pdf`;

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: savedFileName,
        format: 'pdf',
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
