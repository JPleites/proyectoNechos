import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosinventarioController } from './movimientosinventario.controller';

describe('MovimientosinventarioController', () => {
  let controller: MovimientosinventarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosinventarioController],
    }).compile();

    controller = module.get<MovimientosinventarioController>(MovimientosinventarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
