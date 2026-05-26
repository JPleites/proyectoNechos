import { Test, TestingModule } from '@nestjs/testing';
import { GeneradorCodigoService } from './generador-codigo.service';

describe('GeneradorCodigoService', () => {
  let service: GeneradorCodigoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneradorCodigoService],
    }).compile();

    service = module.get<GeneradorCodigoService>(GeneradorCodigoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
