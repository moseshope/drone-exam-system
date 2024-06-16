import {all, call, put, takeLatest} from 'redux-saga/effects'
import { getPlans, getPlansFailure, getPlansSuccess } from './planSlice';
import { getRequest, postRequest } from '../../services/axiosClient';
import { setStorage } from '../../helpers';


function* getPlansAPI(action) {
  try {
    const response = yield call(() => getRequest('plans'));
    yield put(getPlansSuccess(response.data));
  } catch (e) {
    yield put(getPlansFailure());
  }
}

export default function* rootSaga() {
  yield all([takeLatest(getPlans, getPlansAPI)]);
}
