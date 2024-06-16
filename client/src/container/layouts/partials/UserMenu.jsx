import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Dropdown } from 'antd';
import { LockOutlined, UserOutlined, AuditOutlined, SafetyOutlined, IdcardOutlined, BankOutlined, CommentOutlined, FileImageOutlined, TrophyOutlined } from '@ant-design/icons';

import { logout } from '../../../redux/auth/authSlice';

import constants from '../../../config/constants';

const UserMenu = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const items = [
    // {
    //   label: 'My projects',
    //   key: '/projects',
    //   icon: <FileImageOutlined />,
    // },
    {
      label: <div className='flex items-center'><Avatar size="large" src={user.avatar ? `${constants.SOCKET_URL}${user.avatar}` : '/imgs/avatar.png'} /><div className='ml-1'>{user.name}<br />{user.email}</div></div>,
      key: 'user',
      type: 'group',
      children: [
        {
          label: 'Profile',
          key: '/user/profile',
          icon: <IdcardOutlined />,
        },
        // {
        //   label: 'Plans',
        //   key: '/plans',
        //   icon: <UnorderedListOutlined />,
        // },
      ]
    },
    {
      label: 'Admin',
      key: 'admin',
      type: 'group',
      icon: <SafetyOutlined />,
      children: [
        {
          label: 'Dashboard',
          key: '/admin/',
          icon: <BankOutlined />,
        },
        {
          label: 'Users',
          key: '/admin/users',
          icon: <UserOutlined />,
        },
        {
          label: 'Problems',
          key: '/admin/problems',
          icon: <TrophyOutlined />,
        },
        {
          label: 'Exams',
          key: '/admin/exams',
          icon: <AuditOutlined />
        }
      ]
    },
    {
      label: 'Log Out',
      key: '/auth/logout',
      icon: <LockOutlined />,
    },
  ];

  const handleClick = ({ item, key }) => {
    if (key === '/auth/logout') {
      dispatch(logout());
    } else {
      navigate(key);
    }
  }

  return (
    <Dropdown
      menu={{
        items: items.filter(item => item.key != 'admin' || (item.key == 'admin' && user.isAdmin)),
        onClick: handleClick,
      }}
      trigger='click'
      placement="bottomLeft"
      arrow
    >
      {/* <Button type='primary' size='large' icon={<UserOutlined />}>{user.name}</Button> */}
      <Avatar src={user.avatar ? `${constants.SOCKET_URL}${user.avatar}` : '/imgs/avatar.png'} className='shadow-lg cursor-pointer' />
    </Dropdown>
  )
};

export default UserMenu;
