import { useParams } from "react-router-dom";
import { Schedule } from "../coach";
import { useEffect, useState } from "react";
import { Button, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { convertUtcToLocalTime } from "../../utils.ts";

export function Student() {
  const { id: studentId } = useParams();
  const [upcomingSchedules, setUpcomingSchedules] = useState<Array<Schedule>>(
    [],
  );

  function loadUpcomingSchedules() {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((schedules: Array<Schedule>) => {
        schedules.forEach((s) => {
          s.call_start_time = convertUtcToLocalTime(s.call_start_time);
          s.call_end_time = convertUtcToLocalTime(s.call_end_time);
        });
        setUpcomingSchedules(schedules);
      })
      .catch((e) => console.log(e));
  }

  function handleReservation(id: string) {
    fetch(`/api/schedules/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ student_id: studentId }),
    })
      .then((res) => res.json())
      .then((schedule) => {
        // NOTE: I shouldn't be needing to remove schedule from upcomingSchedules
        // (cuz I'm re-fetching), couldn't find the REAL issue.
        setUpcomingSchedules((prevState) =>
          prevState.filter((s) => s.id !== schedule.id),
        );
        loadUpcomingSchedules();
      })
      .catch((e) => console.log(e));
  }

  useEffect(() => {
    loadUpcomingSchedules();
  }, []);

  const upcomingScheduleColumns: ColumnsType<Schedule> = [
    {
      key: "coach",
      title: "Coach",
      render: (_, record) => (
        <span>
          {record?.users?.find((u) => u?.role === "coach")?.first_name}
        </span>
      ),
    },
    {
      key: "call_start_time",
      title: "Starts At",
      dataIndex: "call_start_time",
    },
    {
      key: "call_end_time",
      title: "Ends At",
      dataIndex: "call_end_time",
    },
    {
      key: "reserve_call",
      title: "Reserve",
      render: (_: string, record: Schedule) => (
        <Button type={"primary"} onClick={() => handleReservation(record.id)}>
          Reserve
        </Button>
      ),
    },
  ];

  return (
    <>
      <h4>Available Schedules:</h4>
      <Table
        columns={upcomingScheduleColumns}
        dataSource={upcomingSchedules}
        pagination={false}
      />
    </>
  );
}
