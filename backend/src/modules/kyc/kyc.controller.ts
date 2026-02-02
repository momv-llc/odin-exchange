import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KycService, SubmitKycDto, UploadDocumentDto } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../admin-auth/guards/admin-auth.guard';
import { KycStatus, KycLevel } from '@prisma/client';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  getStatus(@Req() req: any) {
    return this.kycService.getKycStatus(req.user.id);
  }

  @Post('submit')
  submitKycData(@Req() req: any, @Body() dto: SubmitKycDto) {
    return this.kycService.submitKycData(req.user.id, dto);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpeg|jpg|png|webp|pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.kycService.uploadDocument(req.user.id, file, dto);
  }

  @Post('submit-for-review')
  submitForReview(@Req() req: any) {
    return this.kycService.submitForReview(req.user.id);
  }
}

@Controller('admin/kyc')
@UseGuards(AdminAuthGuard)
export class AdminKycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  getAllSubmissions(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.kycService.getAllKycSubmissions(
      status as KycStatus,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('stats')
  getStats() {
    return this.kycService.getKycStats();
  }

  @Get(':id')
  getSubmission(@Param('id') id: string) {
    return this.kycService.getKycSubmission(id);
  }

  @Post(':id/approve')
  approveKyc(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { level?: KycLevel },
  ) {
    return this.kycService.approveKyc(id, req.admin.id, body.level);
  }

  @Post(':id/reject')
  rejectKyc(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { reason: string },
  ) {
    return this.kycService.rejectKyc(id, req.admin.id, body.reason);
  }

  @Post('document/:id/verify')
  verifyDocument(
    @Param('id') id: string,
    @Body() body: { verified: boolean; reason?: string },
  ) {
    return this.kycService.verifyDocument(id, body.verified, body.reason);
  }
}
