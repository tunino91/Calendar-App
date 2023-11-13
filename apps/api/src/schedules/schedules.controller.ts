import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, { ...updateScheduleDto });
  }
}
