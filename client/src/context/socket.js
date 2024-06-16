import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";

import constants from "../config/constants";
import { getStorage } from "../helpers";
import { getUser } from "../redux/auth/authSlice";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const socket = useRef(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    // console.log(isAuthenticated, isConnected);
    if (!isConnected) {
      socket.current = io(constants.SOCKET_URL, {
        query: {
          token: getStorage("token"),
        },
      });

      socket.current.on("connect", () => {
        console.info(`connected`);
        setConnected(true);
      });

      socket.current.on("disconnect", () => {
        // window.location.reload();
        console.info(`disconnected`);
        setConnected(false);
      });

      socket.current.on("error", (err) => {
        console.log("Socket Error:", err.message);
      });

      socket.current.on('SUBSCRIPTION_EVENT', (data) => {
        // message.warning(data.message, 5);
        console.log('SUBSCRIPTION_EVENT');
        dispatch(getUser());
      });

      socket.current.on('NOTIFICATION_EVENT', (data) => {
        // message.warning(data.message, 5);
        console.log('NOTIFICATION_EVENT');
        // dispatch(getUser());
        message.info(data.message);
      });

    }

    return () => {
      if (socket.current && socket.current.connected) {
        socket.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
