export class CreateScheduleDto {
  readonly call_start_time: Date;
  readonly call_end_time: Date;
  readonly coach_id: string;
}
