import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransferenciaInventarioDto {
  @IsString()
  @IsNotEmpty()
  productoCodigo!: string;

  @IsString()
  @IsNotEmpty()
  ubicacionOrigen!: string;

  @IsString()
  @IsNotEmpty()
  ubicacionDestino!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;

  @IsOptional()
  @IsString()
  referencia?: string;
}