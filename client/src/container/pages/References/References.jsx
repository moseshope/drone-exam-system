import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Table,
  Pagination,
  Input,
  Modal,
  Form,
  Layout,
  notification,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import constants from "../../../config/constants";
import { useDispatch, useSelector } from "react-redux";
import { updatePageState } from "../../../redux/references/refSlice";
import { del, getAll} from "../../../services/refAPI";
import useForm from "../../../Hooks/useForm";
import { getStorage } from '../../../helpers';
import moment from "moment";
import axios from "axios"; // To handle the file upload manually

const { Content } = Layout;

function References() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  console.log(user);
  const pageState = useSelector((state) => state.references) || {
    page: 1,
    total: 0,
    pageSize: 10,
  };

  const [refList, setRefList] = useState([]);
  const [page, setPage] = useState(pageState.page);
  const [total, setTotal] = useState(pageState.total);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(pageState.pageSize);
  const [formData, handleChange] = useForm({});
  const [status, setStatus] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [fileList, setFileList] = useState([]); // State to manage selected file

  const [form] = Form.useForm();

  const showNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: "bottomRight",
    });
  };

  const initModalStatus = () => {
    form.resetFields();
    setModalStatus(false);
    setEditStatus(false);
    setFileList([]); // Reset file list when modal is closed
  };

  const delRef = async (_id) => {
    try {
      await del({ _id: _id });
      showNotification("success", "Success", "Successfully deleted!");
    } catch (error) {
      showNotification("error", "Error", "Failed to delete Reference");
      console.log("Error deleting References:", error);
    }
    setStatus(!status);
  };

  const saveRef = async () => {
    try {
      await form.validateFields(); // Validate form fields before submission
      if (editStatus) {
        await updateRef();
      } else {
        await addRef();
      }
    } catch (error) {
      console.log("Error adding/editing Reference:", error);
    }
  };

  const addRef = async () => {
    try {
      const data = new FormData();
      fileList.forEach((file) => {
        data.append("file", file);
      });
      data.append("description", form.getFieldValue("description"));

      await axios.post(`${constants.HOST_URL}references/add`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": getStorage("token"),
        }
      });

      showNotification("success", "Success", "Successfully added!");
    } catch (error) {
      showNotification("error", "Error", "Failed to add Reference");
      console.log("Error adding Reference:", error);
    }
    setStatus(!status);
    initModalStatus();
  };

  const updateRef = async () => {
    try {
      const data = new FormData();
      fileList.forEach((file) => {
        data.append("file", file);
      });
      data.append("description", form.getFieldValue("description"));
      data.append("_id", form.getFieldValue("_id"));

      await axios.post(`${constants.HOST_URL}references/update`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": getStorage("token"),
        }
      });

      showNotification("success", "Success", "Successfully updated!");
    } catch (error) {
      showNotification("error", "Error", "Failed to update Reference");
      console.log("Error updating Reference:", error);
    }
    setStatus(!status);
    initModalStatus();
  };

  const columns = [
    {
      title: "No",
      dataIndex: "_id",
      key: "no",
      width: "70px",
      render: (_, row, index) => <>{(page - 1) * pageSize + index + 1}</>,
    },
    {
      title: "File",
      dataIndex: "dir",
      key: "dir",
      width: "400px",
      render: (_, row) => (
        <div className="flex items-center">
          <a
            href={`${constants.SOCKET_URL}${row.dir}`}
            className="ml-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <b>{row.fileName}</b>
          </a>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "400px",
      render: (_, row) => (
        <div className="flex items-center">
          <div className="ml-2">
            <b>{row.description}</b>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_) => {
        return moment(_).format("MM/DD/YY hh:mm A");
      },
    },
    user.isAdmin ? {
      title: "Control Options",
      dataIndex: "file_no",
      key: "file_no",
      width: "150px",
      render: (_, row) => (
        <div className="flex items-center">
          <div className="ml-2 flex gap-2">
            <Button
              type="primary"
              onClick={() => {
                setEditStatus(true);
                setModalStatus(true);
                form.setFieldsValue(row);
              }}
            >
              Update
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Confirm",
                  content: "Are you sure to remove this file?",
                  onOk: () => {
                    delRef(row._id);
                  },
                });
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ),
    } : {}
  ];

  useEffect(() => {
    getAllRefs();
  }, [page, pageSize]);

  useEffect(() => {
    getAllRefs();
  }, [status]);

  const getAllRefs = (current) => {
    setLoading(true);
    getAll({
      ...formData,
      page: current || page,
      limit: pageSize,
    }).then((data) => {
      setLoading(false);
      setRefList(data.refs.map((ref) => ({ ...ref, key: ref._id })));
      setTotal(data.total);
      dispatch(
        updatePageState({
          total: data.total,
          page,
          pageSize,
        })
      );
    });
  };

  const handlePageChange = (pageNumber, pageSize) => {
    setPage(pageNumber);
    setPageSize(pageSize);
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.map((file) => file.originFileObj));
  };

  return (
    <Content className="mx-auto p-2 px-5 my-5">
      <Row gutter={[16, 16]}>
        {user.isAdmin && <Col span={24}>
          <Button
            type="primary"
            className="float-right"
            onClick={() => {
              setModalStatus(true);
            }}
          >
            Add
          </Button>
        </Col>}
        <Col span={24}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={refList}
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
      <Modal
        title={editStatus ? "Edit" : "Add"}
        centered
        open={modalStatus}
        width={1024}
        onOk={saveRef}
        onCancel={initModalStatus}
        footer={[
          <Button key="submit" type="primary" onClick={saveRef}>
            Save
          </Button>,
          <Button key="back" type="primary" onClick={initModalStatus}>
            Cancel
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveRef}
        >
          <Form.Item
            label="Attach File"
            rules={[
              {
                required: !editStatus, // File is required only when adding
                message: "Please select the file",
              },
            ]}
            name="file"
          >
            <Upload
              beforeUpload={() => false} // Prevent automatic upload
              onChange={handleUploadChange}
              fileList={fileList}
              listType="text"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Description"
            rules={[
              {
                required: true,
                message: "This content could not be empty",
              },
            ]}
            name="description"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}

export default References;
