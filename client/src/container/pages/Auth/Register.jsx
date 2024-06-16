import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { register } from '../../../redux/auth/authSlice';
import GuestLayout from '../../layouts/GuestLayout';
import { setStorage } from '../../../helpers';

const { Title } = Typography;

function Register() {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const loader = useSelector(state => state.auth.loader);
  const errors = useSelector(state => state.auth.errors);
  const dispatch = useDispatch();
  const onFinish = (values) => {
    // console.log('Received values of form: ', values);
    setStorage('registered', '1');
    dispatch(register({ ...values, search: location.search }));
    // navigate('/welcome');
  };
  return (
    <GuestLayout>
      <Card className='w-[400px] shadow-lg'>
        <div className="text-center my-4">
          <Title level={3}>Register</Title>
        </div>
        <Form
          name="register"
          form={form}
          className="form"
          scrollToFirstError
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: 'Please input your Name!',
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
                message: 'Please input your E-mail!',
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
                message: 'Please input your password!',
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
                message: 'Please confirm your password!',
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
          <Form.Item>
            <Button loading={loader} type="primary" htmlType="submit" className="w-full mt-2"
              size="large">Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </GuestLayout>
  );
}

export default Register;
