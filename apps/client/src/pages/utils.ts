import dayjs from "dayjs";

export function convertUtcToLocalTime(time: string) {
  return dayjs(time).local().format("MM-DD-YYYY HH:mm");
}
