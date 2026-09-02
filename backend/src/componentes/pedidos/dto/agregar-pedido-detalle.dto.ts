import {
  IsInt,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AgregarPedidoDetalleDto {
  @IsNotEmpty()
  productoCodigo!: string;

  @IsNotEmpty()
  ubicacion!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;
}