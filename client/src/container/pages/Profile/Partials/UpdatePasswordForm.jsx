import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Card, Typography } from 'antd';
import { updatePassword } from '../../../../redux/auth/authSlice';

const { Title, Text } = Typography;

function UpdatePasswordForm() {
  const [form] = Form.useForm();
  const loader = useSelector(state => state.auth.loader);
  const errors = useSelector(state => state.auth.errors);
  const dispatch = useDispatch();
  const onFinish = (values) => {
    // console.log('Received values of form: ', values);
    dispatch(updatePassword(values));
    form.resetFields();
  };

  return (
    <Card className='max-w-xl w-full shadow-lg'>
      <div className="my-4">
        <Title level={3}>Update Password</Title>
        <Text type='secondary'>Ensure your account is using a long, random password to stay secure.</Text>
      </div>
      <Form
        name="update_password"
        form={form}
        className="form"
        scrollToFirstError
        onFinish={onFinish}
      >
        <Form.Item
          name="oldPassword"
          rules={[
            {
              required: true,
              message: 'Please input current password!',
            },
          ]}
          validateStatus={errors.oldPassword ? 'error' : ''}
          help={errors.oldPassword}
          hasFeedback
        >
          <Input.Password size="large" placeholder="Current Password" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          rules={[
            {
              required: true,
              message: 'Please input new password!',
            },
          ]}
          hasFeedback
        >
          <Input.Password size="large" placeholder="New Password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm new password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password size="large" placeholder="Confirm new Password" />
        </Form.Item>
        <Form.Item>
          <Button loading={loader} type="primary" htmlType="submit" className="mt-2"
            size="large">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default UpdatePasswordForm;