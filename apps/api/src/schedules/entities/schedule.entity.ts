import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column({ type: 'timestamptz' })
  public call_start_time: Date;

  @Column({ type: 'timestamptz' })
  public call_end_time: Date;

  @Column({ nullable: true })
  public coach_rate?: number;

  @Column({ nullable: true })
  public coach_notes?: string;

  @Column({ default: false })
  public is_completed: boolean;

  @ManyToMany(() => User, (user) => user.schedules)
  users: Array<User>;

  public constructor(init?: Partial<Schedule>) {
    Object.assign(this, init);
  }
}
