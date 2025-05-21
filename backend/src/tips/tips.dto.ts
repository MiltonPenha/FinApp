import { ApiProperty } from '@nestjs/swagger';

export class CreateTipDto {
  @ApiProperty()
  content: string;
}
