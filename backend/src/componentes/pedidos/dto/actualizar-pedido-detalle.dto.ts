import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarPedidoDetalleDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cantidad!: number;
}