import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUrlSignedBucketDto } from './dto/create-bucket.dto';

@Controller('bucket')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @UseGuards(JwtAuthGuard)
  @Post()  
  async getUrlSigneds(@Body() createUrlSignedBucketDto: CreateUrlSignedBucketDto) {
    return await this.bucketService.getUrlSigneds(createUrlSignedBucketDto);
  }

}
