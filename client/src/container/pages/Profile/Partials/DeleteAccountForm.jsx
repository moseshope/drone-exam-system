import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Modal, Card, Typography } from 'antd';
import { deleteAccount } from '../../../../redux/auth/authSlice';

const { Title, Text } = Typography;

function DeleteAccountForm() {

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loader = useSelector(state => state.auth.loader);
  const errors = useSelector(state => state.auth.errors);
  const dispatch = useDispatch();

  const onFinish = (values) => {
    // console.log('Received values of form: ', values);
    dispatch(deleteAccount(values));
    form.resetFields();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <Card className='max-w-xl w-full shadow-lg'>
      <div className="my-4">
        <Title level={3}>Delete Account</Title>
        <Text type='secondary'>Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.</Text>
      </div>
      <div className="my-2">
        <Button type="primary" size='large' danger onClick={showModal}>
          Delete Account
        </Button>
        <Modal
          title="Delete Account"
          open={isModalOpen}
          onOk={form.submit}
          onCancel={handleCancel}
          footer={[
            <Button key="back" type='primary' onClick={handleCancel}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" loading={loader} danger onClick={form.submit}>
              Delete Account
            </Button>,
          ]}
        >
          <div className="my-4">
            <Text type='secondary'>Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.</Text>
          </div>
          <Form
            form={form}
            name="delete_account"
            onFinish={onFinish}
          >
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password}
              hasFeedback
            >
              <Input.Password placeholder='Password' size='large' />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Card>
  )
}

export default DeleteAccountForm;