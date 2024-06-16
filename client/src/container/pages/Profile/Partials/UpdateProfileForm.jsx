import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Upload, message, Spin } from 'antd';
import ImgCrop from "antd-img-crop";
import { useSelector, useDispatch } from 'react-redux';

import constants from "../../../../config/constants";
import { getStorage } from '../../../../helpers';
import { getUser, updateProfile } from '../../../../redux/auth/authSlice';

const { Title, Text } = Typography;

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG/WEBP file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

function UpdateProfileForm() {
  const [form] = Form.useForm();
  const loader = useSelector(state => state.auth.loader);
  const user = useSelector(state => state.auth.user);
  const errors = useSelector(state => state.auth.errors);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.avatar);

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    dispatch(updateProfile({ ...values, avatar: imageUrl }));
  };

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setImageUrl(info.file.response?.path);
      info.file.thumbUrl = `${constants.SOCKET_URL}${info.file.response?.path}`;
      setLoading(false);
      dispatch(getUser());
    }
  };

  return (
    <Card className='max-w-xl w-full shadow-lg'>
      <div className="my-4">
        <Title level={3}>Profile Information</Title>
        <Text type='secondary'>Update your account's profile information and email address.</Text>
      </div>
      <Form
        name="register"
        form={form}
        initialValues={{
          name: user.name,
          email: user.email,
        }}
        className="form"
        scrollToFirstError
        onFinish={onFinish}
      >
        <Form.Item
          name="avatar"
        >
          <ImgCrop rotationSlider>
            <Upload
              name="file"
              listType="picture-circle"
              className="avatar-uploader"
              multiple={false}
              showUploadList={false}
              action={`${constants.HOST_URL}users/upload`}
              accept="image/*"
              headers={{
                Authorization: getStorage("token"),
              }}
              data={{
                oldFile: imageUrl,
              }}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {loading ? <Spin /> : <div className='relative'>
                <img
                  src={imageUrl ? `${constants.SOCKET_URL}${imageUrl}` : "/imgs/avatar.png"}
                  alt="avatar"
                  className='w-full rounded-full'
                />
                <div className="rounded-full absolute top-0 left-0 w-full h-full hover:bg-[#000a] opacity-0 hover:opacity-100 flex items-center justify-center text-white">
                  Change
                </div>
              </div>}
            </Upload>
          </ImgCrop>
        </Form.Item>
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
            autoFocus
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

export default UpdateProfileForm;