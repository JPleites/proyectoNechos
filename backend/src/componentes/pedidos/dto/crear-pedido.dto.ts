import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearPedidoDetalleDto {
  @IsNotEmpty()
  productoCodigo!: string;

  @IsNotEmpty()
  ubicacion!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;
}

export class CrearPedidoDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clienteId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPedidoDetalleDto)
  detalles!: CrearPedidoDetalleDto[];
}
