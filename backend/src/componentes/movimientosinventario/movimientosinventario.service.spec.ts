import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosinventarioService } from './movimientosinventario.service';

describe('MovimientosinventarioService', () => {
  let service: MovimientosinventarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientosinventarioService],
    }).compile();

    service = module.get<MovimientosinventarioService>(MovimientosinventarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
