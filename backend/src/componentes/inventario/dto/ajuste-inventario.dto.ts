import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AjusteInventarioDto {
  @IsString()
  @IsNotEmpty()
  productoCodigo!: string;

  @IsString()
  @IsNotEmpty()
  ubicacion!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;

  @IsString()
  @IsIn(['ENTRADA', 'SALIDA'])
  tipoAjuste!: 'ENTRADA' | 'SALIDA';

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsOptional()
  @IsString()
  referencia?: string;
}