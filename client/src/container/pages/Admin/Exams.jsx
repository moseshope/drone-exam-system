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
import { updatePageState } from "../../../redux/exam/examSlice";

import { getAllExams } from "../../../services/examAPI";
import useForm from "../../../Hooks/useForm";

const { Search } = Input;
const { Content } = Layout;

function Exams() {

  const dispatch = useDispatch();

  const pageState = useSelector(state => state.exam);

  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(pageState.page);
  const [total, setTotal] = useState(pageState.total);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(pageState.pageSize);
  const [formData, handleChange] = useForm({});
  const [form] = Form.useForm();

  const columns = [
    {
      title: "No",
      dataIndex: "_id",
      key: "no",
      width: "70px",
      render: (_, row, index) => <>{(page - 1) * pageSize + index + 1}</>,
    },
    {
      title: "Profile",
      dataIndex: "name",
      key: "name",
      render: (_, row) => <div className='flex items-center'>
        <Avatar size="large" src={row.user.avatar ? `${constants.SOCKET_URL}${row.user.avatar}` : '/imgs/avatar.png'} />
        <div className='ml-2'><b>{row.user.name}</b><br />{row.user.email}</div>
      </div>
    },
    {
        title: "Score",
        dataIndex: "score",
        key: "score",
        width: "120px",
        render: (_, row) => <div className='flex items-center'>
          <div className='ml-2'><b>{row.score}</b></div>
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
    getExams();
  }, [page, pageSize]);

  const getExams = (current) => {
    setLoading(true);
    getAllExams({
      ...formData,
      page: current || page,
      limit: pageSize,
    }).then((data) => {
      setLoading(false);
      setExams(data.exams.map((exam) => ({ ...exam, key: exam._id })));
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
      getExams(1);
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
        <Col sm={12} md={8} lg={6} xl={4}>
          <Search
            placeholder="Min Score..."
            allowClear
            value={formData.minScore}
            name="minScore"
            onChange={handleChange}
            onSearch={onSearch}
          />
        </Col>
        <Col sm={12} md={8} lg={6} xl={4}>
          <Search
            placeholder="Max Score..."
            allowClear
            value={formData.maxScore}
            name="maxScore"
            onChange={handleChange}
            onSearch={onSearch}
          />
        </Col>
        <Col span={24}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={exams}
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

export default Exams;
