import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FloatButton } from 'antd';
import { CustomerServiceOutlined, MoonFilled, SettingFilled, SunFilled } from '@ant-design/icons';

import { setDarkMode } from '../../../redux/app/appSlice';

const Settings = (props) => {

  const dispatch = useDispatch();

  const isDarkMode = useSelector(state => state.app.isDarkMode);

  const changeTheme = () => {
    dispatch(setDarkMode());
  }

  return (
    <FloatButton.Group
      
      trigger="hover"
      type="primary"
      style={{ right: 24 }}
      icon={<SettingFilled />}
    >
      {/* <FloatButton /> */}
      <FloatButton icon={isDarkMode ? <SunFilled /> : <MoonFilled />} onClick={changeTheme} />
    </FloatButton.Group>);
};

export default Settings;