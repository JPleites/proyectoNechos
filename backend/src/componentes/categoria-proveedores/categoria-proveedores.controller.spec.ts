import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaProveedoresController } from './categoria-proveedores.controller';

describe('CategoriaProveedoresController', () => {
  let controller: CategoriaProveedoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaProveedoresController],
    }).compile();

    controller = module.get<CategoriaProveedoresController>(CategoriaProveedoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
