import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DescriptionService } from './description.service';
import { Controller, Post, UseInterceptors, UseGuards, UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../role/role.decorators';
import { UploadFileInput } from './description.dto';
@Controller('description')
@ApiTags('Description')
export class DescriptionController {
  constructor(private descriptionService: DescriptionService) {}

  @Post('upload-image')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles([CREATE_PRODUCT, UPDATE_PRODUCT, CREATE_MANY_PRODUCT, CREATE_PRODUCT_VARIANT])
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFileInput,
  })
  async uploadImage(@UploadedFile() image: any) {
    return await this.descriptionService.uploadImage(image);
  }
}
