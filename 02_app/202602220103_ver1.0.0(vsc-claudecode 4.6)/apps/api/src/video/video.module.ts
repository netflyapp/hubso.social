import { Module } from '@nestjs/common';
import { BunnyStreamService } from './bunny-stream.service';
import { VideoController } from './video.controller';

@Module({
  controllers: [VideoController],
  providers: [BunnyStreamService],
  exports: [BunnyStreamService],
})
export class VideoModule {}
