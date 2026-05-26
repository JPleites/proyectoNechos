import { Module } from '@nestjs/common';
import { GeneradorCodigoService } from '../services/generador-codigo/generador-codigo.service';

@Module({
    providers: [GeneradorCodigoService],
    exports: [GeneradorCodigoService]
})
export class CommonModule {}
