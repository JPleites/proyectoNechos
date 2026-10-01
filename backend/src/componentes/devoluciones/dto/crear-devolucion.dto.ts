import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearDevolucionDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ventaId!: number;

  @IsNotEmpty()
  @IsString()
  productoCodigo!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;

  @IsNotEmpty()
  @IsString()
  motivo!: string;
}
