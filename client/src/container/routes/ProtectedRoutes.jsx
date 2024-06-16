import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import AuthLayout from '../layouts/AuthLayout';
import routes from './routes';
import AdminRoute from './AdminRoute';
import PayedRoute from './PayedRouted';
import { getUser } from '../../redux/auth/authSlice';

function ProtectedRoutes() {

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUser())
  });

  return (
    <AuthLayout>
      <Routes>
        {routes.map(({ component: Component, path, exact, isAdmin, isPayed }, index) => {

          if (isAdmin) {
            return <Route key={index} element={<AdminRoute />}>
              <Route path={`${path}`} key={index} exact={exact} element={<Component />} />
            </Route>
          }
          return <Route path={`${path}`} key={index} exact={exact} element={<Component />} />
        })}
      </Routes>
    </AuthLayout>
  );
}

export default ProtectedRoutes;
