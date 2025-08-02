import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUrlSignedBucketDto } from './dto/create-bucket.dto';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('bucket')
@Controller('bucket')
export class BucketController {
  constructor(private readonly bucketService: BucketService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT no formato: Bearer <token>',
    required: true,
  })
  @Post()
  @ApiOperation({
    description: 'Request retorna os dados para subir midias diretamente pelo front'
  })
  async getUrlSigneds(@Body() createUrlSignedBucketDto: CreateUrlSignedBucketDto) {
    return await this.bucketService.getUrlSigneds(createUrlSignedBucketDto);
  }

}
