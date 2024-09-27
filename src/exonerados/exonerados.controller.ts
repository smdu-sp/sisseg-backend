import { Controller, Get } from '@nestjs/common';
import { ExoneradosService } from './exonerados.service';


@Controller('exonerados')
export class ExoneradosController {
  constructor(private readonly comparisonService: ExoneradosService) {}
  
  @Get('compare')
  async compareRecords() {
    const missingRecords = await this.comparisonService.compareTables();
    return missingRecords;
  }
}
