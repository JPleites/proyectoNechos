import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenesController } from './almacenes.controller';

describe('AlmacenesController', () => {
  let controller: AlmacenesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlmacenesController],
    }).compile();

    controller = module.get<AlmacenesController>(AlmacenesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
