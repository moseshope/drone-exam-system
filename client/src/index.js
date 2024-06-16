import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import "antd/dist/reset.css";
import reportWebVitals from "./reportWebVitals";
// import { Worker } from "@react-pdf-viewer/core";
import App from "./App";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

const storeProvider = store();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"> */}
    <Provider store={storeProvider}>
      <PersistGate loading={null} persistor={persistStore(storeProvider)}>
        <App />
      </PersistGate>
    </Provider>
    {/* </Worker> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// "react-photo-gallery": "^8.0.0",