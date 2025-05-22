import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { NewsService } from './news.service';

@ApiTags('financial-news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de noticias financeiras atuais' })
  async getNews() {
    const news = await this.newsService.fetchNews();

    return {
      statusCode: HttpStatus.OK,
      data: news,
      message: 'Noticias financeiras atualizadas',
    };
  }
}