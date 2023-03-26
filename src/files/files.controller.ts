import { createReadStream } from 'fs';
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service'
import { fileFilter,fileNamer } from './helpers';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files- Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) {}

  @Get('products/:imageName')
  fineProductImage( @Param('imageName') imageName:string){
    const file = createReadStream(this.filesService.getStaticProductImage(imageName))
    return new StreamableFile(file)
  }

  @Post('products')
  @UseInterceptors( FileInterceptor('file',{fileFilter:fileFilter, 
    limits:{
      fileSize:1000000
    },
    storage:diskStorage({
      destination:'./static/products',
      filename:fileNamer
    })

  })
    )
  uploadProductFile( 
    @UploadedFile() file:Express.Multer.File
  ){
    if(!file){
      throw new BadRequestException('Make sure that the file in an image')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${file.filename}`

    return { secureUrl }
  }

}
