import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPostController } from './category-post.controller';

describe('CategoryPost Controller', () => {
  let controller: CategoryPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryPostController],
    }).compile();

    controller = module.get<CategoryPostController>(CategoryPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
