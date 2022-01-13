import multer from 'multer';

export const uploadProfile = multer({ dest: 'uploads/profile' });
export const uploadCafeBg = multer({ dest: 'uploads/cafeBg' });
