import React from 'react';
import { useSelector } from 'react-redux';
import {
  Outlet,
  Navigate,
  useLocation,
} from 'react-router-dom';

function PrivateRoute() {
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to='/login' state={{ from: location }} />;
}

export default PrivateRoute;