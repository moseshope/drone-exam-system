import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Table,
  Pagination,
  Modal,
  Layout,
  notification,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updatePageState } from "../../../redux/database/dbSlice";
import { deleteDBFile, getAll, backup, restore } from "../../../services/dbAPI";
import useForm from "../../../Hooks/useForm";
import moment from "moment";
import constants from "../../../config/constants";

const { Content } = Layout;

function Database() {

  const dispatch = useDispatch();

  const pageState = useSelector(state => state.database);

  const [dbList, setDBList] = useState([]);
  const [page, setPage] = useState(pageState.page);
  const [total, setTotal] = useState(pageState.total);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(pageState.pageSize);
  const [formData, handleChange] = useForm({});
  const [status, setStatus] = useState(false);
  
  const showNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: 'bottomRight',
    });
  };

  const delFile = async (_id) => {
    try {
      await deleteDBFile({ _id: _id });
      showNotification('success', 'Success', 'Successfully deleted!');
      setStatus(!status);
    } catch (err) {
      showNotification('error', 'Error', 'Failed to delete DB');
      console.log('Error fetching DBs:', err);
    }
    setStatus(!status);
  }

  const backupDB = async () => {
    try {
      await backup();
      showNotification('success', 'Success', 'Successfully backed up!');
    } catch (err) {
      showNotification('error', 'Error', 'Failed to backup DB');
      console.log('Error backup DB:', err);
    }
    setStatus(!status);
  }

  const restoreDB = async (backupFile) => {
    try {
      await restore({ backupFile });
      showNotification('success', 'Success', 'Successfully restored!');
    } catch (err) {
      showNotification('error', 'Error', 'Failed to restore DB');
      console.log('Error restore DB:', err);
    }
    setStatus(!status);
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
      title: "File",
      dataIndex: "dir",
      key: "dir",
      width: "400px",
      render: (_, row) => <div className='flex items-center'>
        <a href={`${constants.SOCKET_URL}/db/${row.fileName}`} className='ml-2'><b>{row.fileName}</b></a>
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
    {
      title: "Control Options",
      dataIndex: "file_no",
      key: "file_no",
      width: "150px",
      render: (_, row) => <div className='flex items-center'>
        <div className='ml-2 flex gap-2'>
          <Button type="primary" onClick={() => {
            Modal.confirm({
              title: 'Confirm',
              content: 'Are you sure to restore Database with this file?',
              onOk: () => {
                restoreDB(row.dir)
              }
            });
            }
          }>Restore</Button>
          <Button type="primary" danger onClick={() => {
            Modal.confirm({
              title: 'Confirm',
              content: 'Are you sure to remove this file?',
              onOk: () => {
                delFile(row._id);
              }
            });
          }}>Delete</Button>
        </div>
      </div>
    }
  ];

  useEffect(() => {
    getDBFiles();
  }, [page, pageSize]);

  useEffect(() => {
    getDBFiles();
  }, [status]);

  const getDBFiles = (current) => {
    setLoading(true);
    getAll({
      ...formData,
      page: current || page,
      limit: pageSize,
    }).then((data) => {
      setLoading(false);
      setDBList(data.dbs.map((db) => ({ ...db, key: db._id })));
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

  return (
    <>
      <Content className="mx-auto p-2 px-5 my-5">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Button
              type="primary"
              className="float-right"
              onClick={() => {
                backupDB();
              }}
            >
              Backup DB
            </Button>
          </Col>
          <Col span={24}>
            <Table
              loading={loading}
              columns={columns}
              dataSource={dbList}
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
    </>
  );
}

export default Database;
