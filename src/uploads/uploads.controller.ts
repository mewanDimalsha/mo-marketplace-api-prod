import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as multer from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {

    constructor(private config: ConfigService) {
        // Configure once when controller is created — not on every request
        cloudinary.config({
            cloud_name: this.config.get<string>('CLOUDINARY_NAME'),
            api_key: this.config.get<string>('CLOUDINARY_KEY'),
            api_secret: this.config.get<string>('CLOUDINARY_SECRET'),
        });

        // Log to verify on startup
        console.log('Cloudinary initialized:', {
            cloud_name: this.config.get('CLOUDINARY_NAME'),
            has_key: !!this.config.get('CLOUDINARY_KEY'),
            has_secret: !!this.config.get('CLOUDINARY_SECRET'),
            secret_length: this.config.get<string>('CLOUDINARY_SECRET')?.length,
        });
    }

    @Post('image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Upload product image to Cloudinary' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multer.memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    cb(
                        new BadRequestException('Only image files are allowed'),
                        false,
                    );
                } else {
                    cb(null, true);
                }
            },
        }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file provided');

        const url = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'mo-marketplace' },
                (error, result) => {
                    if (error || !result) {
                        console.error('Cloudinary error:', error);
                        reject(
                            new BadRequestException(
                                error?.message || 'Upload failed',
                            ),
                        );
                    } else {
                        resolve(result.secure_url);
                    }
                },
            );
            Readable.from(file.buffer).pipe(uploadStream);
        });

        return { url };
    }
}