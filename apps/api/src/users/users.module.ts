import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => SchedulesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
