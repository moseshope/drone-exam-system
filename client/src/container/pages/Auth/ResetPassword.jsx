import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Card, Typography, Spin } from 'antd';
import GuestLayout from '../../layouts/GuestLayout';
import { resetPassword, verifyResetLink } from '../../../services/authAPI';

const { Title } = Typography;

function ResetPassword() {

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [verifing, setVerifing] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verified, setVerified] = useState(false);

  const { token } = useParams();

  useEffect(() => {
    setVerifing(true);
    verifyResetLink({ token }).then(res => {
      console.log(res);
      setVerified(true);
    }).catch(err => {
      console.log(err);
      setVerified(false);
    }).finally(() => {
      setVerifing(false);
    });
  }, []);

  const onFinish = (values) => {
    setLoading(true);
    setMessage("");
    setErrorMessage("");
    resetPassword({
      ...values,
      token
    }).then(res => {
      // console.log(res);
      form.resetFields();
      setMessage(res.data.message);
    }).catch(err => {
      setErrorMessage(err.response.data.message);
    }).finally(() => {
      setLoading(false);
    });
    // navigate('/welcome');
  };

  return (
    <GuestLayout>
      {verifing && <Spin />}
      {(!verifing && verified) && <Card className='w-[400px] shadow-lg'>
        <div className="text-center mt-2 mb-5">
          <Title level={3}>Reset Password</Title>
        </div>
        <div className="my-2">
          {errorMessage && <Alert
            message={errorMessage}
            type="error"
            closable
          />}
          {message && <Alert
            message={<span>{message} <br /> Please <Link to="/login"><span className="underline">Login</span></Link> with new Password!</span>}
            type="success"
            closable
          />}
        </div>
        <Form
          name="rest-password"
          form={form}
          className="form"
          scrollToFirstError
          onFinish={onFinish}
        >
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input new password!',
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
            <Button loading={loading} type="primary" htmlType="submit" className="w-full mt-2"
              size="large">Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Card>}
      {(!verifing && !verified) && <h1 className='effect-1 text-2xl md:text-3xl lg:text-4xl italic'>Invalid or Expired Link</h1>}
    </GuestLayout>
  );
}

export default ResetPassword;
