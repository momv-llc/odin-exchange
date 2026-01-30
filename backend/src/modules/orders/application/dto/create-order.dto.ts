import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString() @IsNotEmpty() fromCurrency: string;
  @IsString() @IsNotEmpty() toCurrency: string;
  @IsNumber() @IsPositive() fromAmount: number;
  @IsEmail() clientEmail: string;
  @IsOptional() @IsString() @MaxLength(50) clientPhone?: string;
  @IsString() @MinLength(20) @MaxLength(255) clientWallet: string;
}
