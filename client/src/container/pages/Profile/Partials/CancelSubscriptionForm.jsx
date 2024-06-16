import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Card, Typography, Popconfirm, message } from "antd";
import {
  cancelSubscription,
  continueSubscription,
  getUserSubscription,
} from "../../../../services/planAPI";
import { getUser } from "../../../../redux/auth/authSlice";
import moment from "moment";

const { Title, Text } = Typography;

function CancelSubscriptionForm() {

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.auth.user);
  const [actSub, setActSub] = useState({});
  const [selSub, setSelSub] = useState({});

  useEffect(() => {
    getUserSubscription().then((res) => {
      setActSub(res.data.activeSubscription ?? {});
      setSelSub(res.data.selectedSubscription ?? {});
    });
  }, []);

  const handleCancel = () => {
    setLoading(true);
    cancelSubscription()
      .then((res) => {
        message.info("Successfully cancelled!");
        // dispatch(getUser());
      })
      .catch(console.log)
      .finally(() => {
        setLoading(false);
      });
  };

  const handleContinue = () => {
    setLoading(true);
    continueSubscription()
      .then((res) => {
        message.info("Successful!");
        // dispatch(getUser());
      })
      .catch(console.log)
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {actSub && (
        <Card className="max-w-xl w-full shadow-lg">
          <div className="my-4">
            <Title level={3}>Plan management</Title>
            <Text type="secondary">Please cancel your plan if you want.</Text>
          </div>
          <Popconfirm
            title="Are you sure?"
            description="Are you sure to cancel current plan?"
            onConfirm={handleCancel}
            okText="Yes"
            cancelText="No"
          >
            <Button loading={loading} type="primary" danger size="large" disabled={actSub.ends_at}>
              {actSub.ends_at ? `Cancels at ${moment(actSub.ends_at).format("MM/DD/YY")}` : "Cancel Plan"}
            </Button>
          </Popconfirm>
          {actSub.ends_at && <Popconfirm
            title="Are you sure?"
            description="Are you sure to continue current plan?"
            onConfirm={handleContinue}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link">Continue</Button>
          </Popconfirm>}
        </Card>
      )}
    </>
  );
}

export default CancelSubscriptionForm;