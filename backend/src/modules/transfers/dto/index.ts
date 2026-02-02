import { IsString, IsOptional, IsNumber, IsEmail, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TransferStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export class CreateTransferDto {
  @IsString()
  senderName: string;

  @IsString()
  senderPhone: string;

  @IsOptional()
  @IsEmail()
  senderEmail?: string;

  @IsString()
  recipientName: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  recipientCityId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTransferStatusDto {
  @IsEnum(TransferStatus)
  status: TransferStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class QueryTransfersDto {
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  recipientCityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class TrackTransferDto {
  @IsString()
  code: string;

  @IsString()
  senderPhone: string;
}
