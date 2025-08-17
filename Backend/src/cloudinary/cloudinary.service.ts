import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        // Validate file format
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!fileExtension || !this.allowedFormats.includes(fileExtension)) {
            throw new BadRequestException(
                `Invalid file type. Allowed types are: ${this.allowedFormats.join(', ')}`
            );
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'E-commerce - Stall',
                    resource_type: 'image',
                    format: fileExtension, // Explicitly set the format
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(error || new Error('Upload failed'));
                    }
                    resolve(result);
                },
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }
}
