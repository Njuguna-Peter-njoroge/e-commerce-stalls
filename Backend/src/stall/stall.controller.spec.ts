import { Test, TestingModule } from '@nestjs/testing';
import { StallController } from './stall.controller';

describe('StallController', () => {
  let controller: StallController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StallController],
    }).compile();

    controller = module.get<StallController>(StallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
