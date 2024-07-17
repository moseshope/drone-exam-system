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

import { getLastExams } from "../../../services/examAPI";
import { getProblemCount } from "../../../services/problemAPI";
import { getUserCount } from "../../../services/userAPI";


import useForm from "../../../Hooks/useForm";
import '../../.././SyncScroll.css';

const { Search } = Input;
const { Content } = Layout;
const { Column, ColumnGroup } = Table;

function Dashboard() {

  const dispatch = useDispatch();

  const pageState = useSelector(state => state.exam);

  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(pageState.page);
  const [total, setTotal] = useState(pageState.total);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(pageState.pageSize);
  const [formData, handleChange] = useForm({});
  const [userCount, setUserCount] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const [form] = Form.useForm();

  const getProblemTotalCount = async () => {
    try {
      const res = await getProblemCount();
      setProblemCount(res.data.count);
    } catch (error) {
      console.log(error)
    }
  }

  const getUserTotalCount = async () => {
    try {
      const res = await getUserCount();
      setUserCount(res.data.count);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getProblemTotalCount();
    getUserTotalCount();
  }, [])

  useEffect(() => {
    getExams();
  }, [page, pageSize]);

  const getExams = (current) => {
    setLoading(true);
    getLastExams({
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
    <Content className="mx-auto p-2 px-5 my-5 w-full">
      <div className="mb-[50px] flex items-center justify-around text-center">
        <Col >
          <div className="dash-card text-center px-5 py-3">
            <h1 className="tracking-widest">Total Users</h1>
            <p className="text-[36px] mb-0">{userCount}</p>
          </div>
        </Col>               
        <Col>
          <div className="dash-card text-center px-5 py-3">
            <h1 className="tracking-widest">Total Problems</h1>
            <p className="text-[36px] mb-0">{problemCount}</p>
          </div>
        </Col>    
      </div>
      <Row gutter={[64, 64]} className="!mr-0 !ml-0">
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
        <Col span={24} >
          <Table
            loading={loading}
            dataSource={exams}
            pagination={false}
            style={{'overflow-x': 'auto'}}
          >
            <Column
              title="No"
              dataIndex="_id"
              key="no"
              width="10px"
              render={(_, row, index) => <>{(page - 1) * pageSize + index + 1}</>}
            />
            <Column 
              title="Profile"
              dataIndex="name"
              key="name"
              width="10px"
              render={(_, row) => (
                <div className="flex items-center">
                  <Avatar 
                    size="large" 
                    src={row.user.avatar ? `${constants.SOCKET_URL}${row.user.avatar}` : '/imgs/avatar.png'} 
                  />
                  <div className="ml-2">
                    <b>{row.user.name}</b>
                    <br />
                    {row.user.email}
                  </div>
                </div>
              )}
            />
            <ColumnGroup title="Exam Score">
              <Column 
                title="1" 
                dataIndex="sectionScore" 
                key="sectionScore1"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score1[0]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="2" 
                dataIndex="sectionScore" 
                key="sectionScore2"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score2[0]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="3" 
                dataIndex="sectionScore" 
                key="sectionScore3"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score3[0]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="4" 
                dataIndex="sectionScore" 
                key="sectionScore4"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score4[0]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="5" 
                dataIndex="sectionScore" 
                key="sectionScore"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score5[0]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="Total" 
                dataIndex="totalScore" 
                key="totalScore" 
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score[0]}</b></div>
                  </div>
                )}
              />
            </ColumnGroup>
            <ColumnGroup title="Exam Score">
              <Column 
                title="1" 
                dataIndex="sectionScore" 
                key="sectionScore1"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score1[1]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="2" 
                dataIndex="sectionScore" 
                key="sectionScore2"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score2[1]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="3" 
                dataIndex="sectionScore" 
                key="sectionScore3"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score3[1]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="4" 
                dataIndex="sectionScore" 
                key="sectionScore4"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score4[1]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="5" 
                dataIndex="sectionScore" 
                key="sectionScore"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score5[1]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="Total" 
                dataIndex="totalScore" 
                key="totalScore" 
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score[1]}</b></div>
                  </div>
                )}
              />
            </ColumnGroup>
            <ColumnGroup title="Exam Score">
              <Column 
                title="1" 
                dataIndex="sectionScore" 
                key="sectionScore1"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score1[2]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="2" 
                dataIndex="sectionScore" 
                key="sectionScore2"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score2[2]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="3" 
                dataIndex="sectionScore" 
                key="sectionScore3"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score3[2]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="4" 
                dataIndex="sectionScore" 
                key="sectionScore4"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score4[2]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="5" 
                dataIndex="sectionScore" 
                key="sectionScore"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score5[2]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="Total" 
                dataIndex="totalScore" 
                key="totalScore" 
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score[2]}</b></div>
                  </div>
                )}
              />
            </ColumnGroup>
            <ColumnGroup title="Exam Score">
              <Column 
                title="1" 
                dataIndex="sectionScore" 
                key="sectionScore1"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score1[3]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="2" 
                dataIndex="sectionScore" 
                key="sectionScore2"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score2[3]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="3" 
                dataIndex="sectionScore" 
                key="sectionScore3"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score3[3]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="4" 
                dataIndex="sectionScore" 
                key="sectionScore4"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score4[3]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="5" 
                dataIndex="sectionScore" 
                key="sectionScore"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score5[3]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="Total" 
                dataIndex="totalScore" 
                key="totalScore" 
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score[3]}</b></div>
                  </div>
                )}
              />
            </ColumnGroup>
            <ColumnGroup title="Exam Score">
              <Column 
                title="1" 
                dataIndex="sectionScore" 
                key="sectionScore1"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score1[4]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="2" 
                dataIndex="sectionScore" 
                key="sectionScore2"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score2[4]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="3" 
                dataIndex="sectionScore" 
                key="sectionScore3"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score3[4]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="4" 
                dataIndex="sectionScore" 
                key="sectionScore4"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score4[4]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="5" 
                dataIndex="sectionScore" 
                key="sectionScore"
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score5[4]}</b></div>
                  </div>
                )}
              />
              <Column 
                title="Total" 
                dataIndex="totalScore" 
                key="totalScore" 
                render={(_, row) => (
                  <div className='flex items-center'>
                    <div className='ml-2'><b>{row.score[4]}</b></div>
                  </div>
                )}
              />
            </ColumnGroup>
            <Column
              title="Date"
              dataIndex="createdAt"
              key="createdAt"
              render={(_) => {
                  return moment(_).format("MM/DD/YY hh:mm A");
                }
              }
            />
          </Table>
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

export default Dashboard;
