import { Module } from '@nestjs/common';
import { ExoneradosService } from './exonerados.service';
import { ExoneradosController } from './exonerados.controller';

@Module({
  providers: [ExoneradosService],
  controllers: [ExoneradosController],  
})
export class ExoneradosModule {}
