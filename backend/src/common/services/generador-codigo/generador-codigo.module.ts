import { Global, Module } from '@nestjs/common';
import { GeneradorCodigoService } from './generador-codigo.service';

@Global()
@Module({
  providers: [GeneradorCodigoService],
  exports: [GeneradorCodigoService],
})
export class GeneradorCodigoModule {}