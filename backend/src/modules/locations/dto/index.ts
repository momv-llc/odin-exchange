import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Country DTOs
export class CreateCountryDto {
  @IsString()
  code: string;

  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsOptional()
  @IsString()
  nameUa?: string;

  @IsOptional()
  @IsString()
  nameDe?: string;

  @IsOptional()
  @IsString()
  flagEmoji?: string;

  @IsOptional()
  @IsString()
  phoneCode?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsOptional()
  @IsString()
  nameUa?: string;

  @IsOptional()
  @IsString()
  nameDe?: string;

  @IsOptional()
  @IsString()
  flagEmoji?: string;

  @IsOptional()
  @IsString()
  phoneCode?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// City DTOs
export class CreateCityDto {
  @IsString()
  countryId: string;

  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsOptional()
  @IsString()
  nameUa?: string;

  @IsOptional()
  @IsString()
  nameDe?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  population?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsOptional()
  @IsString()
  nameUa?: string;

  @IsOptional()
  @IsString()
  nameDe?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsInt()
  population?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

// Query DTOs
export class QueryCountriesDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryCitiesDto {
  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
