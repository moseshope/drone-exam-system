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
  Tooltip,
  message,
  Layout,
  Badge,
  Avatar,
} from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import constants from "../../../config/constants";
import { updatePageState } from "../../../redux/user/userSlice";

import { getAllUsers } from "../../../services/userAPI";
import useForm from "../../../Hooks/useForm";

const { Search } = Input;
const { Content } = Layout;

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

  return (
    <Content className="mx-auto p-2 px-5 my-5">
      <Row gutter={[16, 16]}>
        <Col sm={12} md={8} lg={6} xl={4}>
          <Search
            placeholder="Name..."
            allowClear
            value={formData.name}
            name="name"
            onChange={handleChange}
            onSearch={onSearch}
          />
        </Col>
        <Col sm={12} md={8} lg={6} xl={4}>
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
    </Content>
  );
}

export default Users;
