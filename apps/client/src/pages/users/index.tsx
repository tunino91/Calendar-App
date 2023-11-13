import { useEffect, useState } from "react";
import { Button, Input, Form, Modal, Table, Select, message } from "antd";
import { Link } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { User } from "./types.ts";

type FormSubmit = Omit<User, "id">;
export default function Users() {
  const [users, setUsers] = useState<Array<User>>([]);
  const [form] = Form.useForm<FormSubmit>();
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  function handleCreateUser(values: FormSubmit) {
    fetch("/api/users", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((user) => {
        setUsers((prevState) => [...prevState, user]);
        setIsFormVisible(false);
      })
      .catch((e) => message.error(e));
  }

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((users) => setUsers(users))
      .catch((e) => message.error(e));
  }, []);

  const columns: ColumnsType<User> = [
    {
      key: "name",
      title: "Name",
      render: (_: string, record: User) => (
        <Link
          to={
            record.role === "coach"
              ? `/coaches/${record.id}`
              : `/students/${record.id}`
          }
        >
          {[record.first_name, record.last_name].join(" ")}
        </Link>
      ),
    },
    {
      key: "role",
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (
    <>
      <h4>All Users:</h4>
      <Table columns={columns} dataSource={users} pagination={false} />
      <Button onClick={() => setIsFormVisible(true)}>Create User</Button>
      <Modal
        title={"Create User"}
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onOk={() => setIsFormVisible(false)}
        destroyOnClose={true}
        footer={[]}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleCreateUser}
        >
          <Form.Item
            name={"first_name"}
            label={"First Name"}
            rules={[{ message: "Please enter a first name", required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={"last_name"}
            label={"Last Name"}
            rules={[{ message: "Please enter a last name", required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={"role"}
            label={"Role"}
            rules={[{ message: "Please select a role", required: true }]}
          >
            <Select
              options={[
                { value: "student", label: "Student" },
                { value: "coach", label: "Coach" },
              ]}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
