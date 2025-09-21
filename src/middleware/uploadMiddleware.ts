import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// CREATE DIRECTORIES
const createUploadDirs = () => {
  const baseDir =
    process.env.NODE_ENV === 'production'
      ? '/home/h2h/uploads' // UBERSPACE PERSISTENT (hopefully)
      : path.join(process.cwd(), 'uploads');

  const dirs = [
    path.join(baseDir, 'users'),
    path.join(baseDir, 'ngos'),
    path.join(baseDir, 'projects'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return baseDir;
};

// CONFIGURE MULTER STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = createUploadDirs();
    const uploadType = req.params.type || 'misc';
    const destinationPath = path.join(baseDir, uploadType);
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// FILE VALIDATION FOR IMAGES ONLY
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'));
  }
};

// CREATE MULTER INSTANCE
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// MIDDLEWARE FOR SINGLE IMAGE UPLOAD
export const uploadSingleImage = upload.single('image');

// MIDDLEWARE FOR MULTI IMAGE UPLOAD (max 5 for projects)
export const uploadMultipleImages = upload.array('images', 5);

// HELPER FUNCTION TO GET IMAGE URL
export const getImageUrl = (filename: string, type: string): string => {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? `https://${process.env.UBERSPACE_DOMAIN || 'your-domain.uberspace.de'}`
      : `http://localhost:${process.env.PORT || 3333}`;

  return `${baseUrl}/uploads/${type}/${filename}`;
};

// HELPER FUNCTION TO DELETE OLD IMAGE
export const deleteImageFile = (imagePath: string): void => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error('Error deleting image file:', error);
  }
};

// HELPER FUNCTION TO EXTRACT FILE NAME FROM URL
export const getFilenameFromUrl = (url: string): string => {
  return path.basename(new URL(url).pathname);
};

// HELPER FUNCTION TO GET FULL FILE PATH FROM URL
export const getFilePathFromUrl = (url: string): string => {
  const baseDir =
    process.env.NODE_ENV === 'production'
      ? '/home/h2h/uploads'
      : path.join(process.cwd(), 'uploads');

  const urlPath = new URL(url).pathname;
  const relativePath = urlPath.replace('/uploads/', '');
  return path.join(baseDir, relativePath);
};

export default upload;
