import { all, call, put, takeLatest } from 'redux-saga/effects'
import { message } from 'antd';

import {
  login,
  register,
  loginSuccess,
  loginFailure,
  logout,
  logoutSuccess,
  getUser,
  getUserSuccess,
  getUserFailure,
  updateProfile,
  updateProfileSuccess,
  updateProfileFailure,
  updatePassword,
  updatePasswordSuccess,
  updatePasswordFailure,
  deleteAccount,
  deleteAccountFailure,
  getPlan,
  getPlanSuccess,
  getPlanFailure,
} from './authSlice';
import { getRequest, postRequest } from '../../services/axiosClient';
import { setStorage } from '../../helpers';


function* loginAPI(action) {
  try {
    const response = yield call(() => postRequest('auth/login', action.payload));
    yield setStorage('token', response.data.token);
    yield put(loginSuccess(response.data));
  } catch (e) {
    let email = e.response.data?.errors?.email ?? 'These credentials do not match our records.';
    yield put(loginFailure({
      errors: {
        email
      }
    }));
  }
}

function* registerAPI(action) {
  try {
    const { search, ...rest } = action.payload;
    const response = yield call(() => postRequest('auth/register' + search, rest));
    yield setStorage('token', response.data.token);
    // navigate('/welcome');
    yield put(loginSuccess({ ...response.data }));
  } catch (e) {
    yield put(loginFailure(e.response.data));
  }
}

function* updateProfileAPI(action) {
  try {
    const response = yield call(() => postRequest('users/updateProfile', action.payload));
    message.success('Profile updated successfully!');
    yield put(updateProfileSuccess(response.data));
  } catch (e) {
    yield put(updateProfileFailure());
  }
}

function* updatePasswordAPI(action) {
  try {
    const response = yield call(() => postRequest('users/updatePassword', action.payload));
    message.success('Passowrd updated successfully!');
    yield put(updatePasswordSuccess());
  } catch (e) {
    yield put(updatePasswordFailure(e.response.data));
  }
}

function* deleteAccountAPI(action) {
  try {
    const response = yield call(() => postRequest('users/deleteAccount', action.payload));
    message.success('Your account successfully deleted!');
    yield put(logoutSuccess());
  } catch (e) {
    yield put(deleteAccountFailure(e.response.data));
  }
}

function* logoutAPI() {
  try {
    // const response = yield call(() => postRequest('auth/register', action.payload));
    yield setStorage('token');
    yield put(logoutSuccess());
  } catch (e) {
    // yield put(loginFailure(e.response.data));
  }
}

function* getUserAPI() {
  try {
    const response = yield call(() => getRequest('users/me'));
    yield put(getUserSuccess(response.data));
  } catch (e) {
    yield setStorage('token');
    yield put(getUserFailure());
  }
}

function* getPlanAPI() {
  try {
    const response = yield call(() => getRequest('plans/activePlan'));
    let data = response.data;
    if (!data.plan?.property) {
      data.plan = undefined;
    }
    yield put(getPlanSuccess(data));
  } catch (e) {
    yield put(getPlanFailure());
  }
}

export default function* rootSaga() {
  yield all([takeLatest(login, loginAPI), takeLatest(register, registerAPI), takeLatest(logout, logoutAPI), takeLatest(getUser, getUserAPI), takeLatest(updateProfile, updateProfileAPI), takeLatest(updatePassword, updatePasswordAPI), takeLatest(deleteAccount, deleteAccountAPI), takeLatest(getPlan, getPlanAPI)]);
}
