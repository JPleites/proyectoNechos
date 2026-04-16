import { Test, TestingModule } from '@nestjs/testing';
import { UbicacionesController } from './ubicaciones.controller';

describe('UbicacionesController', () => {
  let controller: UbicacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UbicacionesController],
    }).compile();

    controller = module.get<UbicacionesController>(UbicacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
