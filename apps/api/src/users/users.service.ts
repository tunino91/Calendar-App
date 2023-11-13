import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new User({ ...createUserDto });
    return this.userRepo.save(user);
  }

  // this is to be used on the home page to display all users (coach and/or students)
  findAll(): Promise<Array<User>> {
    return this.userRepo.find();
  }

  // give a users schedules after now..
  findOne(id: string, upcoming?: boolean, previous?: boolean): Promise<User> {
    const utcNow = new Date(new Date(Date.now()).toUTCString());
    const baseQuery = this.userRepo
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.schedules', 'schedules')
      .orderBy('schedules.call_start_time', 'DESC')
      .where('users.id = :userId', { userId: id });
    if (upcoming) {
      baseQuery
        .andWhere('schedules.is_completed IS NOT TRUE')
        .andWhere('schedules.call_start_time >= :utcNow::TIMESTAMP', {
          utcNow,
        });
    } else if (previous) {
      baseQuery.andWhere('schedules.is_completed IS TRUE');
    }
    return baseQuery.getOne();
  }
}
