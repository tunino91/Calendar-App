import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../types/users.types';
import { Schedule } from '../../schedules/entities/schedule.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public first_name: string;

  @Column()
  public last_name: string;

  @Column()
  public role: Role;

  @ManyToMany(() => Schedule, (schedule) => schedule.users, {
    cascade: true,
  })
  @JoinTable()
  schedules?: Array<Schedule>;

  public constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}
