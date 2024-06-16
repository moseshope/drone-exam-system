import React from "react";
import { useSelector } from "react-redux";
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { getStorage } from "../../helpers";

function PublicRoute() {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const flag = getStorage('registered');
  return !isAuthenticated ? <Outlet /> : <Navigate to={flag ? '/home' : '/home'} />
}

export default PublicRoute;