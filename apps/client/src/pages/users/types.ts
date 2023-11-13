import { Schedule } from "./coach";

export type Role = "student" | "coach";

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  role: Role;
  schedules?: Array<Schedule>;
};
