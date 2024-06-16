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
  Popconfirm,
  notification,
} from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import constants from "../../../config/constants";
import { updatePageState } from "../../../redux/problem/problemSlice";

import { getAllProblems, addProblems, updateProblem, deleteProblem } from "../../../services/problemAPI";
import useForm from "../../../Hooks/useForm";
import { getStorage, setStorage } from "../../../helpers";
import axios from "axios";

const { Search } = Input;
const { Content } = Layout;

function Problems() {

  const dispatch = useDispatch();

  const pageState = useSelector(state => state.problem);

  const [problems, setProblems] = useState([]);
  const [page, setPage] = useState(pageState.page);
  const [total, setTotal] = useState(pageState.total);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(pageState.pageSize);
  const [formData, handleChange] = useForm({});
  const [form] = Form.useForm();
  const [openProblemModal, setOpenProblemModal] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [probId, setProbId] = useState();
  const showNitication = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: 'bottomRight',
    });
  };



  const saveProblem = async () => {
    const data = form.getFieldsValue();
    if(!editStatus) {
      try {
        const result = await addProblems({data: data})
        setEditStatus(!editStatus);
        setOpenProblemModal(false);
        showNitication('success', 'Success', 'Successfully added!');
      } catch (err) {
        showNitication('error', 'Error', 'Failed to add problem');
        console.log('Error fetching problems:', err);
      }
    } else {
      try {
        data._id = probId;
        const result = await updateProblem({data: data});
        showNitication('success', 'Success', 'Successfully updated!');
        setProbId('');
        setEditStatus(!editStatus);
        setOpenProblemModal(false);
        form.resetFields();
      } catch (err) {
        showNitication('error', 'Error', 'Failed to update problem');
        console.log('Error fetching problems:', err);
      }
    }
  };
  const formItemLayout = {
    // labelCol: {
    //   xs: {
    //     span: 24,
    //   },
    //   sm: {
    //     span: 6,
    //   },
    // },
    // wrapperCol: {
    //   xs: {
    //     span: 24,
    //   },
    //   sm: {
    //     span: 14,
    //   },
    // },
  };

  const editProblem = (probData) => {
    setEditStatus(true);
    setOpenProblemModal(true);
    let _id = probData._id;
    setProbId(_id);
    probData['avail_answer_1'] = probData.avail_answers[0];
    probData['avail_answer_2'] = probData.avail_answers[1];
    probData['avail_answer_3'] = probData.avail_answers[2];
    form.setFieldsValue(probData);
  }

  const delProblem = async (_id) => {
    try {
      const result = await deleteProblem({_id: _id});
      showNitication('success', 'Success', 'Successfully deleted!');
      setEditStatus(!editStatus);
    } catch (err) {
      showNitication('error', 'Error', 'Failed to delete problem');
        console.log('Error fetching problems:', err);
    }
  }

  const initModalStatus = () => {
    setOpenProblemModal(false);
    setEditStatus(false);
  }

  const columns = [
    {
      title: "No",
      dataIndex: "_id",
      key: "no",
      width: "70px",
      render: (_, row, index) => <>{(page - 1) * pageSize + index + 1}</>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: "120px",
      render: (_, row) => <div className='flex items-center'>
        <div className='ml-2'><b>{row.category}</b></div>
      </div>
    },
    {
        title: "ProblemNo",
        dataIndex: "prob_no",
        key: "prob_no",
        width: "100px",
        render: (_, row) => <div className='flex items-center'>
          <div className='ml-2'><b>{row.prob_no}</b></div>
        </div>
      },
      {
        title: "Problem Content",
        dataIndex: "prob_content",
        key: "prob_content",
        width: "200px",
        render: (_, row) => <div className='flex items-center'>
          <div className='ml-2'><b>{row.prob_content}</b></div>
        </div>
      },
      {
        title: "Available Answers",
        dataIndex: "avail_answers",
        key: "avail_answers",
        width: "300px",
        render: (_, row) => <div className='flex items-center'>
          <div className='ml-2'><b>1. {row.avail_answers[0]}</b><br /><b>2. {row.avail_answers[1]}</b><br /><b>3. {row.avail_answers[2]}</b></div>
        </div>
      },
      {
        title: "Correct Answer",
        dataIndex: "cor_answer",
        key: "cor_answer",
        width: "30px",
        render: (_, row) => <div className='flex items-center'>
          <div className='ml-2'><b>{row.cor_answer}</b></div>
        </div>
      },
      {
        title: "Correct Answer Explanation",
        dataIndex: "cor_description",
        key: "cor_description",
        width: "200px",
        render: (_, row) => <div className='flex items-center'>
          <div className='ml-2'><b>{row.cor_description}</b></div>
        </div>
      },
      {
        title: "Control Options",
        dataIndex: "prob_no",
        key: "prob_no",
        width: "150px",
        render: (_, row) => <div className='flex items-center'>
        <div className='ml-2 flex gap-2'><Button type="primary" onClick={() => editProblem(row)}>Edit</Button><Button type="primary" danger onClick={() => {
            Modal.confirm({
              title: 'Confirm',
              content: 'Are you sure to remove this problem?',
              onOk: () => {
                delProblem(row._id);
              }
            });
          }}>Delete</Button></div>
      </div>
      }
    // {
    //   title: "Date",
    //   dataIndex: "createdAt",
    //   key: "createdAt",
    //   render: (_) => {
    //     return moment(_).format("MM/DD/YY hh:mm A");
    //   },
    // },
  ];

  useEffect(() => {
    getProblems();
  }, [page, pageSize]);

  useEffect(() => {
    getProblems();
  }, [editStatus]);

  const getProblems = (current) => {
    setLoading(true);
    getAllProblems({
      ...formData,
      page: current || page,
      limit: pageSize,
    }).then((data) => {
      setLoading(false);
      setProblems(data.problems.map((problem) => ({ ...problem, key: problem._id })));
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
      getProblems(1);
    } else {
      setPage(1);
    }
  };

  return (
    <>
      <Content className="mx-auto p-2 px-5 my-5">
        <Row gutter={[16, 16]}>
          <Col sm={8} md={8} lg={6} xl={4}>
            <Search
              placeholder="Category ..."
              allowClear
              value={formData.category}
              name="category"
              onChange={handleChange}
              onSearch={onSearch}
            />
          </Col>
          <Col sm={8} md={8} lg={6} xl={4}>
            <Search
              placeholder="Problem No ....."
              allowClear
              value={formData.prob_no}
              name="prob_no"
              onChange={handleChange}
              onSearch={onSearch}
            />
          </Col>
          <Col  sm={8} md={8} lg={12} xl={16}>
          <Button
            type="primary"
            className="float-right"
            onClick={() => {
              setOpenProblemModal(true);
              setEditStatus(false);
              form.resetFields();
            }}
          >
            Add Problem
          </Button>
        </Col>
          <Col span={24}>
            <Table
              loading={loading}
              columns={columns}
              dataSource={problems}
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
    <Modal title={editStatus ? 'Edit Problem' : 'Add Problem'} centered open={openProblemModal} width={1024} onOk={() => saveProblem()} onCancel={() => initModalStatus()} footer={[
    <Button key="submit" type="primary" onClick={saveProblem}>
      Save
    </Button>,
      <Button key="back" type="primary" onClick={initModalStatus}>
      Cancel
    </Button>,
    ]}>
      <Form form={form} {...formItemLayout} layout="vertical" onFinish={(values) => {}}>
        <Form.Item
          label="Category"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="category"
          
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Problem No"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="prob_no"
        >
          <InputNumber style={{width: '100%'}} />
        </Form.Item>
        <Form.Item
          label="Problem Content"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="prob_content"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Available Answer 1"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="avail_answer_1"
        >
          <Input  />
        </Form.Item>
        <Form.Item
          label="Available Answer 2"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="avail_answer_2"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Available Answer 3"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="avail_answer_3"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Correct Answer"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="cor_answer"
        >
          <InputNumber style={{width: '100%'}} />
        </Form.Item>
        <Form.Item
          label="Correct Answer Description"
          rules={[
            {
              required: true,
              message: 'This content could not be empty',
            },
          ]}
          name="cor_description"
        >
          <Input />
        </Form.Item>
        
      </Form>
    </Modal>
    </>
  );
}

export default Problems;
