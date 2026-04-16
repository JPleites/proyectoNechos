import { Test, TestingModule } from '@nestjs/testing';
import { ArqueoController } from './arqueo.controller';

describe('ArqueoController', () => {
  let controller: ArqueoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArqueoController],
    }).compile();

    controller = module.get<ArqueoController>(ArqueoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
