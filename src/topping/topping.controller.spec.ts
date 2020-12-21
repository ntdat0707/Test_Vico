import { Test, TestingModule } from '@nestjs/testing';
import { ToppingController } from './topping.controller';

describe('Topping Controller', () => {
  let controller: ToppingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToppingController],
    }).compile();

    controller = module.get<ToppingController>(ToppingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
