import { IsString, IsInt, Min, Max, IsOptional, IsEmail, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateReviewDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  authorName: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  authorEmail?: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great service!' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Fast and reliable exchange. Highly recommended!' })
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 'APPROVED' })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({ example: 'Verified legitimate review' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class QueryReviewsDto {
  @ApiPropertyOptional({ enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
