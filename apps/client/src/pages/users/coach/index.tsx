import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Table,
} from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { RangePickerProps } from "antd/es/date-picker";
import TextArea from "antd/es/input/TextArea";
import { User } from "../types.ts";
import { convertUtcToLocalTime } from "../../utils.ts";

dayjs.extend(utc);

export type Schedule = {
  id: string;
  call_start_time: string;
  call_end_time: string;
  coach_rate?: number;
  coach_notes?: string;
  is_completed: boolean;
  users?: Array<User>;
};

const disabledDate: RangePickerProps["disabledDate"] = (current) => {
  // Can not select days before today
  return current && current < dayjs().subtract(1, "day");
};

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

function disabledDateTime() {
  return {
    disabledHours: () => range(0, 24).splice(0, dayjs().hour()),
    disabledMinutes: () => range(0, 60).splice(0, dayjs().minute() + 1),
  };
}

const previousScheduleColumns: ColumnsType<Schedule> = [
  {
    key: "coach_rate",
    title: "Rating",
    dataIndex: "coach_rate",
    render: (text: number) => <span>{text ?? `None`}</span>,
  },
  {
    key: "coach_notes",
    title: "Notes",
    dataIndex: "coach_notes",
    render: (text: string) => <span>{text ?? `None`}</span>,
  },
];

export function Coach() {
  const { id } = useParams();
  const [upcomingSchedules, setUpcomingSchedules] = useState<Array<Schedule>>(
    [],
  );
  const [previousSchedules, setPreviousSchedules] = useState<Array<Schedule>>(
    [],
  );
  const [isTimeSlotFormVisible, setIsTimeSlotFormVisible] =
    useState<boolean>(false);
  const [slotForm] = Form.useForm<{ dateTime: Dayjs }>();
  const [isCallRatingModalVisible, setIsCallRatingModalVisible] =
    useState<boolean>(false);

  const [isSelectedToday, setIsSelectedToday] = useState<boolean>(true);
  const [ratingForm] = Form.useForm<{
    id: string;
    coach_rate: number;
    coach_notes: string;
  }>();

  function handleCreateTimeSlot(values: { dateTime: Dayjs }) {
    const { dateTime } = values;
    const call_start_time = dateTime.utc().format();
    const call_end_time = dateTime.add(2, "hours").utc().format();

    fetch("/api/schedules", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ coach_id: id, call_start_time, call_end_time }),
    })
      .then((res) => res.json())
      .then((schedule) => {
        schedule.call_start_time = convertUtcToLocalTime(
          schedule.call_start_time,
        );
        schedule.call_end_time = convertUtcToLocalTime(schedule.call_end_time);
        setUpcomingSchedules((prevState) => [...prevState, schedule]);
        setIsTimeSlotFormVisible(false);
      })
      .catch((e) => console.log(e));
  }

  function handleCreateRating(values: {
    coach_rate: number;
    coach_notes: string;
    id: string;
  }) {
    const { coach_rate, coach_notes, id } = values;
    fetch(`/api/schedules/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ coach_rate, coach_notes, is_completed: true }),
    })
      .then((res) => res.json())
      .then((schedule) => {
        setIsCallRatingModalVisible(false);
        // NOTE: I shouldn't be needing to remove schedule from upcomingSchedules
        // (cuz I'm re-fetching), couldn't find the REAL issue.
        setUpcomingSchedules((prevState) =>
          prevState.filter((s) => s.id !== schedule.id),
        );
        loadUpcomingSchedules();
        loadPreviousSchedules();
      })
      .catch((e) => console.log(e));
  }

  function loadUpcomingSchedules() {
    fetch(`/api/users/${id}?upcoming=true`)
      .then((res) => res.json())
      .then((user: User) => {
        user?.schedules?.forEach((s) => {
          s.call_start_time = convertUtcToLocalTime(s.call_start_time);
          s.call_end_time = convertUtcToLocalTime(s.call_end_time);
        });
        setUpcomingSchedules(user?.schedules ?? []);
      })
      .catch((e) => console.log(e));
  }

  function loadPreviousSchedules() {
    fetch(`/api/users/${id}?previous=true`)
      .then((res) => res.json())
      .then((user: User) => {
        user?.schedules?.forEach((s) => {
          s.call_start_time = convertUtcToLocalTime(s.call_start_time);
          s.call_end_time = convertUtcToLocalTime(s.call_end_time);
        });
        setPreviousSchedules(user?.schedules ?? []);
      })
      .catch((e) => console.log(e));
  }

  useEffect(() => {
    loadUpcomingSchedules();
    loadPreviousSchedules();
  }, []);

  const upcomingScheduleColumns: ColumnsType<Schedule> = [
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
      key: "call_action_end",
      title: "Call Completed",
      dataIndex: "id",
      render: (id: string) => (
        <Button
          type={"primary"}
          danger={true}
          onClick={() => {
            ratingForm.setFieldValue("id", id);
            setIsCallRatingModalVisible(true);
          }}
        >
          Complete
        </Button>
      ),
    },
  ];

  return (
    <>
      <h4>Upcoming Schedules:</h4>
      <Table
        columns={upcomingScheduleColumns}
        dataSource={upcomingSchedules}
        pagination={false}
      />
      <Button onClick={() => setIsTimeSlotFormVisible(true)}>
        Create Time Slot
      </Button>
      <Modal
        title={"Time Slot"}
        open={isTimeSlotFormVisible}
        onCancel={() => setIsTimeSlotFormVisible(false)}
        onOk={() => setIsTimeSlotFormVisible(false)}
        destroyOnClose={true}
        footer={[]}
      >
        <Form
          form={slotForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleCreateTimeSlot}
        >
          <Form.Item
            name={"dateTime"}
            label={"Date"}
            rules={[{ message: "Please pick a date and time", required: true }]}
          >
            <DatePicker
              onSelect={(date) =>
                setIsSelectedToday(date.date() === dayjs().date())
              }
              disabledDate={disabledDate}
              disabledTime={
                isSelectedToday ? () => disabledDateTime() : undefined
              }
              showTime={{ format: "HH:mm" }}
              format={"YYYY-MM-DD HH:mm"}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={"Rate Call"}
        open={isCallRatingModalVisible}
        onCancel={() => {
          setIsCallRatingModalVisible(false);
          loadUpcomingSchedules();
          loadPreviousSchedules();
        }}
        onOk={() => {
          setIsCallRatingModalVisible(false);
          loadUpcomingSchedules();
          loadPreviousSchedules();
        }}
        destroyOnClose={true}
        footer={[]}
      >
        <Form
          form={ratingForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleCreateRating}
        >
          <Form.Item hidden={true} name={"id"}>
            <Input type="hidden" value={ratingForm.getFieldValue("id")} />
          </Form.Item>
          <Form.Item name={"coach_rate"} label={"Rating"}>
            <InputNumber min={1} max={5} />
          </Form.Item>
          <Form.Item name={"coach_notes"} label={"Notes"}>
            <TextArea rows={4} placeholder="maxLength is 100" maxLength={100} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <h4>Previous Schedules:</h4>
      <Table
        columns={previousScheduleColumns}
        dataSource={previousSchedules}
        pagination={false}
      />
    </>
  );
}
