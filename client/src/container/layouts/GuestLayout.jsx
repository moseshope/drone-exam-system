import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { Button, Layout, Menu } from "antd";
import { UserAddOutlined, UnlockOutlined, MoonFilled } from "@ant-design/icons";

import { clearErrors } from "../../redux/auth/authSlice";
import { setDarkMode } from "../../redux/app/appSlice";
import LogoSrc from "../../assets/images/logo.png";
import smLogoSrc from "../../assets/images/logo-sm.png";
import Settings from "./partials/Settings";

const { Header, Content } = Layout;

const items = [
  {
    label: "Login",
    key: "/login",
    icon: <UnlockOutlined />,
  },
  {
    label: "Register",
    key: "/register",
    icon: <UserAddOutlined className="ml-2" />,
  },
];

function GuestLayout({ children }) {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isDarkMode = useSelector(state => state.app.isDarkMode);

  const handleClick = ({ item, key }) => {
    dispatch(clearErrors());
    navigate(key + location.search);
  };

  return (
    <Layout>
      {/*<Sider/>*/}
      <Layout>
        <Header className={classNames(!isDarkMode && "bg-white", "px-2")}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="demo-logo">
              <Link to="/" className="hidden sm:inline">
              <h2 className="text-[30px]">Rapid Aerial Part 107 Practice Exam</h2>
              </Link>
              <Link to="/" className="inline sm:hidden">
              <h2 className="text-[30px]">Rapid Aerial Part 107 Practice Exam</h2>
              </Link>
            </div>
            <div className="flex items-center">
              {items.map((item, index) => <Link key={item.key} to={item.key}><Button type="link" icon={item.icon}>{item.label}</Button></Link>)}
              {/* <Menu
                theme="light"
                mode="horizontal"
                items={items}
                defaultSelectedKeys={[location.pathname]}
                onClick={handleClick}
              /> */}
            </div>
          </div>
        </Header>
        <Content
          className="w-screen flex items-center justify-center px-4"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          {children}
        </Content>
      </Layout>
      <Settings />
    </Layout>
  );
}

export default GuestLayout;
