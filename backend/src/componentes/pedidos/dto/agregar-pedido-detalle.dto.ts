import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AgregarPedidoDetalleDto {
  @IsNotEmpty()
  productoCodigo!: string;

  @IsNotEmpty()
  ubicacion!: string;

  @Type(() => Number)
  @IsPositive()
  cantidad!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  descuento?: number;
}