import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import multer from 'multer';
import path from 'path';

const s3 = new aws.S3({
  region: 'ap-northeast-2',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const awsUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bangba-storage',
    ACL: 'public-read',
    key: function (req, file, cb) {
      cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
});

export default awsUpload;
