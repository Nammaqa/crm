// lib/fileUtils.ts
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
export async function ensureUploadDir(dir: string = 'uploads'): Promise<string> {
  const fullPath = path.resolve(process.cwd(), dir);
  try {
    await fs.access(fullPath);
  } catch  {
    await fs.mkdir(fullPath, { recursive: true });
  }
  return fullPath;
}

// Save a file to disk
export async function saveFile(
  buffer: Buffer,
  originalFilename: string,
  dir: string = 'uploads'
): Promise<{ filePath: string; relativePath: string }> {
  const uploadDir = await ensureUploadDir(dir);
  
  // Create a unique filename to prevent collisions
  const uniqueId = uuidv4();
  const extension = path.extname(originalFilename);
  const filename = `${path.basename(originalFilename, extension)}-${uniqueId}${extension}`;
  
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  
  // Return both the full path and a relative path for storage in the database
  return {
    filePath,
    relativePath: `/${dir}/${filename}`,
  };
}

// Delete a file from disk
export async function deleteFile(relativePath: string): Promise<boolean> {
  if (!relativePath) return false;
  
  try {
    // Remove leading slash if present
    const sanitizedPath = relativePath.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), sanitizedPath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}