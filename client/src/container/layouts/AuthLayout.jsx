import React, { useEffect, useState } from "react";
import { Button, Dropdown, Layout, Modal } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BellOutlined } from "@ant-design/icons";

import constants from "../../config/constants";
import UserMenu from "./partials/UserMenu";
import { setDarkMode, setOpenPayModal } from "../../redux/app/appSlice";
import { getPlans } from "../../redux/plan/planSlice";
import { getAll, getCount, update } from "../../services/alertAPI";
import Settings from "./partials/Settings";

const { Header } = Layout;
const stripePromise = loadStripe(constants.stripePK);

function AuthLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.app.isDarkMode);
  const openPayModal = useSelector((state) => state.app.openPayModal);
  const user = useSelector((state) => state.auth.user);
  const plans = useSelector((state) => state.plan.plans ?? []);

  const [counts, setCounts] = useState(0);
  const [menuItems, setMenuItems] = useState([]);

  const getCounts = async () => {
    try {
      const tempCounts = await getCount();
      setCounts(tempCounts.data.count);
    } catch (error) {
      console.error("Failed to get counts:", error);
    }
  };

  const getItems = async () => {
    try {
      const tempItems = (await getAll()).data.alerts;
      console.log(tempItems);
      const tempMenuItems = tempItems.map((tempItem, index) => ({
        label: (
          <div>
            <h4>{tempItem.title}</h4>
            <p>{tempItem.content}</p>
          </div>
        ),
        key: index,
      }));
      setMenuItems(tempMenuItems);
    } catch (error) {
      console.error("Failed to get menu items:", error);
    }
  };

  const updateAlert = async () => {
    try {
      await update();
      getCounts(); // Optionally, refresh the count after updating
    } catch (error) {
      console.log("Failed to update alerts:", error);
    }
  }

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(getPlans());
    }
    getCounts();
    getItems();
  }, []);

  const changeTheme = () => {
    dispatch(setDarkMode());
  };

  const setOpenModal = () => {
    dispatch(setOpenPayModal());
  };

  return (
    <>
      <Layout className="min-h-screen">
        <Header
          className={classNames(
            "shadow sticky px-0 top-0 z-[999]",
            !isDarkMode && "bg-white"
          )}
        >
          <div className="flex items-center justify-between px-2 max-w-7xl mx-auto">
            <div className={classNames("demo-logo h-[64px] mb-2", !isDarkMode && "bg-white")}>
              <Link to="/home" className="hidden sm:inline">
                <h2 className="text-[30px]">Rapid Aerial Part 107 Practice Exam</h2>
              </Link>
              <Link to="/home" className="inline sm:hidden">
                <h2 className="text-[30px]">Rapid Aerial Part 107 Practice Exam</h2>
              </Link>
            </div>
            <div className="flex items-center">
              <div>
                <Link to="/home" className="mr-2 sm:mr-6">
                  Home
                </Link>
                <Link to="/references" className="mr-2 sm:mr-6">
                  References
                </Link>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} className="mr-2 sm:mr-6">
                  <a onClick={(e) => {
                    e.preventDefault();
                    updateAlert();
                  }}>
                    <BellOutlined />
                    {counts > 0 && <span className="text-red-500">{counts}</span>}
                  </a>
                </Dropdown>
              </div>
              <UserMenu />
            </div>
          </div>
        </Header>
        <Layout>{children}</Layout>
        <Settings />
      </Layout>
    </>
  );
}

export default AuthLayout;
