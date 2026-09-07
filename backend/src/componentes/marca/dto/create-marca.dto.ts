import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMarcaDto {
  @IsNotEmpty()
  nombre: string = '';

  @Type(() => Number)
  @IsInt()
  proveedorId?: number;
}