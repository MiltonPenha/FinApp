import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('financial-news')
@Controller('news')
export class NewsController {
  constructor(private readonly tipsService: NewsService) { }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de noticias financeiras atuais' })
  async getTips() {
    const tips = await this.tipsService.fetchNews();

    return {
      statusCode: HttpStatus.OK,
      data: tips,
      message: 'Noticias financeiras atualizadas',
    };
  }
}