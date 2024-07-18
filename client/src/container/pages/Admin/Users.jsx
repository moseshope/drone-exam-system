import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Table,
  Tag,
  Space,
  Pagination,
  Input,
  Modal,
  Form,
  InputNumber,
  notification,
  Tooltip,
  message,
  Layout,
  Badge,
  Avatar,
  Switch
} from "antd";
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import constants from "../../../config/constants";
import { updatePageState } from "../../../redux/user/userSlice";
import { addNewUser } from "../../../services/authAPI";

import { getAllUsers, updateUser } from "../../../services/userAPI";
import useForm from "../../../Hooks/useForm";


const { Search } = Input;
const { Content } = Layout;
const showNitication = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
    placement: 'bottomRight',
  });
};

function Users() {

  const dispatch = useDispatch();

  const pageState = useSelector(state => state.user);

  const [showGiveModal, setShowGiveModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(pageState.page);
  const [total, setTotal] = useState(pageState.total);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(pageState.pageSize);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, handleChange] = useForm({});
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const errors = {}

  const initModalStatus = () => {
    form.setFieldsValue([]);
    setOpenModal(false);
  }

  const columns = [
    {
      title: "No",
      dataIndex: "_id",
      key: "no",
      width: "70px",
      render: (_, row, index) => <>{(page - 1) * pageSize + index + 1} {row.socketId.length > 0 ? <Badge status="success" /> : <Badge status="default" />}</>,
    },
    {
      title: "Profile",
      dataIndex: "name",
      key: "name",
      render: (_, row) => <div className='flex items-center'>
        <Avatar size="large" src={row.avatar ? `${constants.SOCKET_URL}${row.avatar}` : '/imgs/avatar.png'} />
        <div className='ml-2'><b>{row.name}</b><br />{row.email}</div>
      </div>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, row) => <div className='flex items-center'>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked={row.status}
          onChange={(e) => updateUserAvailable(e, row._id)}
        />
      </div>
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_) => {
        return moment(_).format("MM/DD/YY hh:mm A");
      },
    },
  ];

  useEffect(() => {
    getUsers();
  }, [page, pageSize]);

  const updateUserAvailable = async (value, id) => {
    let data = {};
    data['status'] = value;
    data['_id'] = id;
    console.log(data);
    try {
      const res = await updateUser(data);
    } catch (err) {
      console.log(err);
    }

  }

  const getUsers = (current) => {
    setLoading(true);
    getAllUsers({
      ...formData,
      page: current || page,
      limit: pageSize,
    }).then((data) => {
      setLoading(false);
      setUsers(data.users.map((user) => ({ ...user, key: user._id })));
      setTotal(data.total);
      dispatch(updatePageState({
        total: data.total,
        page,
        pageSize,
      }));
    });
  };

  const handlePageChange = (pageNumber, pageSize) => {
    setPage(pageNumber);
    setPageSize(pageSize);
  };

  const onSearch = () => {
    if (page == 1) {
      getUsers(1);
    } else {
      setPage(1);
    }
  };

  const registeNewUser = async (values) => {
    try {
      const res = await addNewUser(values);
      showNitication('success', 'Success', 'Successfully added!');
      getUsers();
      initModalStatus();
    } catch {
      showNitication('error', 'Error', 'Failed to add user');
    }
  }

  const openUserModal = () => {
    form.resetFields();
    setOpenModal(true);
  }

  return (
    <Content className="mx-auto p-2 px-5 my-5">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ "float": "right" }}><Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()}>Add</Button></div>
        </Col>
        <Col sm={8} md={8} lg={6} xl={4}>
          <Search
            placeholder="Name..."
            allowClear
            value={formData.name}
            name="name"
            onChange={handleChange}
            onSearch={onSearch}
          />
        </Col>
        <Col sm={8} md={8} lg={6} xl={4}>
          <Search
            placeholder="Email..."
            allowClear
            value={formData.email}
            name="email"
            onChange={handleChange}
            onSearch={onSearch}
          />
        </Col>

        <Col span={24}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={users}
            pagination={false}
          />
          <div className="text-right mt-2">
            <Pagination
              showQuickJumper
              showSizeChanger
              pageSize={pageSize}
              current={page}
              total={total}
              onChange={handlePageChange}
            />
          </div>
        </Col>
      </Row>
      <Modal title={'New User'} centered open={openModal} width={1024} /* onOk={() => registeNewUser()} */ onCancel={() => initModalStatus()} footer={[
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Save
        </Button>,
        <Button key="back" type="primary" onClick={() => initModalStatus()}>
          Cancel
        </Button>,
      ]}>
        <Form
          name="register1"
          form={form}
          className="form"
          scrollToFirstError
          onFinish={registeNewUser}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: 'Please input User Name!',
              },
            ]}
          >
            <Input size="large"
              placeholder="Name"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input E-mail!',
              },
            ]}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email}
          >
            <Input size='large'
              placeholder="E-mail" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Confirm Password" />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}

export default Users;
