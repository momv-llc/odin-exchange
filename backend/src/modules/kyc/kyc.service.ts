import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus, KycLevel, DocumentType } from '@prisma/client';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';

export interface SubmitKycDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface UploadDocumentDto {
  type: DocumentType;
  documentNumber?: string;
  issuedBy?: string;
  issuedDate?: string;
  expiryDate?: string;
}

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'kyc');

  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getKycStatus(userId: string) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            isVerified: true,
            uploadedAt: true,
            rejectionReason: true,
          },
        },
      },
    });

    if (!kyc) {
      return {
        status: KycStatus.NOT_STARTED,
        level: KycLevel.NONE,
        documents: [],
      };
    }

    return kyc;
  }

  async submitKycData(userId: string, dto: SubmitKycDto) {
    const existingKyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (existingKyc && existingKyc.status === KycStatus.APPROVED) {
      throw new BadRequestException('KYC already approved');
    }

    const kycData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      dateOfBirth: new Date(dto.dateOfBirth),
      nationality: dto.nationality.toUpperCase(),
      countryOfResidence: dto.countryOfResidence.toUpperCase(),
      address: dto.address,
      city: dto.city,
      postalCode: dto.postalCode,
      status: KycStatus.PENDING,
    };

    if (existingKyc) {
      return this.prisma.kycVerification.update({
        where: { userId },
        data: kycData,
      });
    }

    return this.prisma.kycVerification.create({
      data: {
        userId,
        ...kycData,
      },
    });
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new BadRequestException('Please submit KYC data first');
    }

    if (kyc.status === KycStatus.APPROVED) {
      throw new BadRequestException('KYC already approved');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, PDF');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = nanoid(20) + ext;
    const filePath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Check if document of this type already exists
    const existingDoc = await this.prisma.kycDocument.findFirst({
      where: { kycId: kyc.id, type: dto.type },
    });

    if (existingDoc) {
      // Delete old file
      const oldPath = path.join(this.uploadDir, path.basename(existingDoc.fileUrl));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      // Update existing document
      return this.prisma.kycDocument.update({
        where: { id: existingDoc.id },
        data: {
          fileName: file.originalname,
          fileUrl: '/uploads/kyc/' + filename,
          fileSize: file.size,
          mimeType: file.mimetype,
          documentNumber: dto.documentNumber,
          issuedBy: dto.issuedBy,
          issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          isVerified: false,
          rejectionReason: null,
        },
      });
    }

    // Create new document
    return this.prisma.kycDocument.create({
      data: {
        kycId: kyc.id,
        type: dto.type,
        fileName: file.originalname,
        fileUrl: '/uploads/kyc/' + filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        documentNumber: dto.documentNumber,
        issuedBy: dto.issuedBy,
        issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
  }

  async submitForReview(userId: string) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
      include: { documents: true },
    });

    if (!kyc) {
      throw new BadRequestException('Please submit KYC data first');
    }

    // Check required documents
    const requiredDocs = [DocumentType.PASSPORT, DocumentType.SELFIE];
    const uploadedTypes = kyc.documents.map(d => d.type);
    const hasIdDocument = uploadedTypes.includes(DocumentType.PASSPORT) ||
                          uploadedTypes.includes(DocumentType.ID_CARD) ||
                          uploadedTypes.includes(DocumentType.DRIVERS_LICENSE);
    const hasSelfie = uploadedTypes.includes(DocumentType.SELFIE);

    if (!hasIdDocument) {
      throw new BadRequestException('Please upload an ID document (passport, ID card, or driver license)');
    }

    if (!hasSelfie) {
      throw new BadRequestException('Please upload a selfie with your ID document');
    }

    return this.prisma.kycVerification.update({
      where: { userId },
      data: { status: KycStatus.IN_REVIEW },
    });
  }

  // Admin methods
  async getAllKycSubmissions(status?: KycStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [submissions, total] = await Promise.all([
      this.prisma.kycVerification.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.kycVerification.count({ where }),
    ]);

    return { submissions, total, page, limit };
  }

  async getKycSubmission(kycId: string) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { id: kycId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        documents: true,
      },
    });

    if (!kyc) throw new NotFoundException('KYC submission not found');
    return kyc;
  }

  async approveKyc(kycId: string, adminId: string, level: KycLevel = KycLevel.BASIC) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { id: kycId },
    });

    if (!kyc) throw new NotFoundException('KYC submission not found');

    // Update KYC status
    const updated = await this.prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: KycStatus.APPROVED,
        level,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        documentVerified: true,
        selfieVerified: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Update user KYC level
    await this.prisma.user.update({
      where: { id: kyc.userId },
      data: { kycLevel: level },
    });

    // Mark all documents as verified
    await this.prisma.kycDocument.updateMany({
      where: { kycId },
      data: { isVerified: true },
    });

    return updated;
  }

  async rejectKyc(kycId: string, adminId: string, reason: string) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { id: kycId },
    });

    if (!kyc) throw new NotFoundException('KYC submission not found');

    return this.prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: KycStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async verifyDocument(documentId: string, verified: boolean, reason?: string) {
    return this.prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        isVerified: verified,
        rejectionReason: verified ? null : reason,
      },
    });
  }

  async getKycStats() {
    const [total, notStarted, pending, inReview, approved, rejected] = await Promise.all([
      this.prisma.kycVerification.count(),
      this.prisma.kycVerification.count({ where: { status: KycStatus.NOT_STARTED } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.PENDING } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.IN_REVIEW } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.APPROVED } }),
      this.prisma.kycVerification.count({ where: { status: KycStatus.REJECTED } }),
    ]);

    return { total, notStarted, pending, inReview, approved, rejected };
  }
}
