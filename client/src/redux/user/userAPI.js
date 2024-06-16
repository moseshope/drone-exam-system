import { all, call, put, takeLatest } from 'redux-saga/effects'
import { getAllPlans } from '../../services/planAPI';


// function* getPlansAPI(action) {
//   try {
//     const response = yield call(() => getAllPlans());
//     yield put(getPlansSuccess(response.data));
//   } catch (e) {
//     // yield put(getPlansFailure());
//   }
// }

export default function* rootSaga() {
  // yield all([takeLatest(getPlans, getPlansAPI)]);
}
