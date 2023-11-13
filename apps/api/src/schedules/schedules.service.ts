import {
  forwardRef,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(User)
    private UserRepo: Repository<User>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const { coach_id } = createScheduleDto;

    const coach = await this.usersService.findOne(coach_id);

    const schedule = new Schedule({
      ...createScheduleDto,
      users: [coach],
    });
    return this.scheduleRepo.save(schedule);
  }

  // student to see all the AVAILABLE schedules across-coaches
  async findAll(): Promise<Array<Schedule>> {
    const utcNow = new Date(new Date(Date.now()).toUTCString());

    const schedules = await this.scheduleRepo
      .createQueryBuilder('schedules')
      .leftJoin('schedules.users', 'users')
      .where('schedules.call_start_time >= :utcNow::TIMESTAMP', {
        utcNow,
      })
      .groupBy('schedules.id')
      .having('COUNT(users.id) < 2') // Filter based on the count of users
      .orderBy('schedules.call_start_time', 'DESC')
      .getMany();

    // users that have the schedules listed above
    const users = await this.UserRepo.createQueryBuilder('users')
      .leftJoinAndSelect('users.schedules', 'schedules')
      .where('schedules.id IN (:...scheduleIds)', {
        scheduleIds: schedules.map((s) => s.id),
      })
      .getMany();

    const schedulesWithUsers = schedules.map((schedule) => ({
      ...schedule,
      users: users.filter((user) =>
        user.schedules.some((userSchedule) => userSchedule.id === schedule.id),
      ),
    }));
    return schedulesWithUsers;
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const { student_id } = updateScheduleDto;
    let schedule = await this.scheduleRepo.findOneOrFail({
      where: { id },
      relations: { users: true },
    });

    if (student_id) {
      // student reserving slot:
      schedule = await this.reserveSlotForStudent(student_id, schedule);
    }

    delete updateScheduleDto['student_id'];
    const updatedSchedule = new Schedule({
      ...schedule,
      ...updateScheduleDto,
    });
    return this.scheduleRepo.save(updatedSchedule);
  }

  async reserveSlotForStudent(
    student_id: string,
    schedule: Schedule,
  ): Promise<Schedule> {
    const student = await this.usersService.findOne(student_id);

    const slotAlreadyReservedByStudent = schedule?.users?.find(
      (u: User) => u.role === 'student',
    );
    if (slotAlreadyReservedByStudent) {
      throw new UnprocessableEntityException(
        'This slot is already reserved for a student',
      );
    }

    schedule.users = [...schedule.users, student];
    return schedule;
  }
}
