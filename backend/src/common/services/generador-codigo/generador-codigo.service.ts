import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneradorCodigoService {
  generate(prefix: string, number: number, length = 8) {
    return `${prefix}${String(number).padStart(length, '0')}`;
  }
}
