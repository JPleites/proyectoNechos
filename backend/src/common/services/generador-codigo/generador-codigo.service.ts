import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneradorCodigoService {
  generate(prefix: string, number: number) {
    return `${prefix}${String(number)}`;
  }
}
