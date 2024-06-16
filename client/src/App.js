import React, { Suspense, useEffect, memo, useContext } from "react";
// import HashLoader from "react-spinners/HashLoader";
import { ConfigProvider, Spin, theme } from "antd";
import classNames from "classnames";
import jwt_decode from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { HappyProvider } from '@ant-design/happy-work-theme';
import themeOverrides from "./config/themeOverrides";
import Login from "./container/pages/Auth/Login";
import Register from "./container/pages/Auth/Register";
import ResetPassword from "./container/pages/Auth/ResetPassword";
import PrivateRoute from "./container/routes/PrivateRoute";
import ProtectedRoutes from "./container/routes/ProtectedRoutes";
import PublicRoute from "./container/routes/PublicRoute";
import { SocketProvider } from "./context/socket";
import { getStorage } from "./helpers";
import { logout } from "./redux/auth/authSlice";

import "./App.css";

const { defaultAlgorithm, darkAlgorithm } = theme;

const App = () => {

  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.app.isDarkMode);

  useEffect(() => {
    let token = getStorage("token");
    if (token) {
      let user = jwt_decode(token);
      if (user.exp * 1000 < Date.now()) {
        dispatch(logout());
      }
    } else {
      dispatch(logout());
    }
  }, []);

  return (
    <HappyProvider>
      <ConfigProvider theme={{ ...themeOverrides, algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}>
        <SocketProvider>
          <Router>
            <Suspense
              fallback={
                <div className={classNames("w-screen h-screen flex items-center justify-center", isDarkMode ? "bg-gray-800" : "bg-white")}>
                  <Spin size="large" />
                </div>
              }
            >
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route exact path="/login" element={<Login />} />
                  <Route exact path="/register" element={<Register />} />
                  <Route exact path="/reset-password/:token" element={<ResetPassword />} />
                </Route>
                <Route element={<PrivateRoute />}>
                  <Route exact path="/*" element={<ProtectedRoutes />} />
                </Route>
                <Route exact path="/" element={<Navigate to="/login" />} />
                <Route exact path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Suspense>
          </Router>
        </SocketProvider>
      </ConfigProvider>
    </HappyProvider>
  );
};

export default memo(App);
