import { Controller, Get, Post, Body } from '@nestjs/common';
import { TipsService } from './tips.service';
import { CreateTipDto } from './tips.dto';

@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Get('random')
  getRandomTip() {
    return this.tipsService.getRandomTip();
  }

  @Get()
  getAllTips() {
    return this.tipsService.findAll();
  }

  @Post()
  create(@Body() createTipDto: CreateTipDto) {
    return this.tipsService.create(createTipDto);
  }
}