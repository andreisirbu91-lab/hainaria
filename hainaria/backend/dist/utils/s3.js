"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
// Configure AWS with MinIO local settings
const s3 = new aws_sdk_1.default.S3({
    endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`,
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadminpassword',
    s3ForcePathStyle: true, // needed with minio
    signatureVersion: 'v4'
});
const bucketName = process.env.MINIO_BUCKET || 'hainaria-assets';
// Make sure bucket exists
s3.headBucket({ Bucket: bucketName }, (err) => {
    if (err && err.statusCode === 404) {
        s3.createBucket({ Bucket: bucketName }, (err) => {
            if (err)
                console.error('Error creating bucket', err);
            else {
                // Set bucket policy to public read
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Sid: 'PublicRead',
                            Effect: 'Allow',
                            Principal: '*',
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${bucketName}/*`]
                        }
                    ]
                };
                s3.putBucketPolicy({ Bucket: bucketName, Policy: JSON.stringify(policy) }, (err) => {
                    if (err)
                        console.error('Error setting bucket policy', err);
                });
            }
        });
    }
});
const uploadToS3 = async (file, folder) => {
    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`;
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    await s3.upload(params).promise();
    return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
};
exports.uploadToS3 = uploadToS3;
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
