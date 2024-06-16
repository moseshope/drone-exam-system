import React from 'react';
import { useSelector } from 'react-redux';
import {
  Outlet,
  Navigate,
  useLocation,
} from 'react-router-dom';

function AdminRoute() {
  const location = useLocation();
  const isAdmin = useSelector(state => state.auth.user.isAdmin);

  return isAdmin ? <Outlet /> : <Navigate to='/home' />;
}

export default AdminRoute;