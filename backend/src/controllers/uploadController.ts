import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

// Helper to upload buffer to Cloudinary
const uploadStream = (buffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'business-app',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadStream(req.file.buffer);

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
};
