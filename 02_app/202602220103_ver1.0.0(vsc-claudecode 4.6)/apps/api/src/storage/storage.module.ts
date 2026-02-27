import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3StorageService } from './s3-storage.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [StorageService, S3StorageService],
  exports: [StorageService, S3StorageService],
})
export class StorageModule {}
