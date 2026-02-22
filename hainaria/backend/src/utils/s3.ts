import AWS from 'aws-sdk';
import multer from 'multer';

// Configure AWS with MinIO local settings
const s3 = new AWS.S3({
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
            if (err) console.error('Error creating bucket', err);
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
                    if (err) console.error('Error setting bucket policy', err);
                });
            }
        });
    }
});

export const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
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

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
