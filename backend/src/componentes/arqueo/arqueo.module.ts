import { Module } from '@nestjs/common';
import { ArqueoController } from './arqueo.controller';
import { ArqueoService } from './arqueo.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ArqueoController],
    providers: [ArqueoService],
})
export class ArqueoModule {}