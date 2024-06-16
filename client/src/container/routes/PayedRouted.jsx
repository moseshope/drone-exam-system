import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Outlet,
  Navigate,
  useLocation,
} from 'react-router-dom';

// import { setOpenPayModal } from '../../redux/app/appSlice';

function PayedRoute() {
  const location = useLocation();
  // const dispatch = useDispatch();
  const isPayed = useSelector(state => state.auth.user.activeSubscription);

  // useEffect(() => {
  //   if (!isPayed) {
  //     dispatch(setOpenPayModal());
  //   }
  // }, [isPayed]);

  return (isPayed?.status == "active") ? <Outlet /> : <Navigate to='/home' />;
}

export default PayedRoute;