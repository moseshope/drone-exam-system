import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Card, Col, Divider, Row, Typography } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { getPlans } from "../../../redux/plan/planSlice";
import CheckoutForm from "./Partials/CheckoutForm";
import constants from "../../../config/constants";

const { Title, Text } = Typography;
// const stripePromise = loadStripe("pk_test_51MqDHeIhTKltFnGq3WGCHjZi5ZfUg5T8aiGVPa7XFZcrse4SGLvTjDbXDNb5inKjlOaJqHJRDv5HsPQ6tbnfsxRL00rwetwKzu");
const stripePromise = loadStripe(constants.stripePK); // Julian Live
function Lists() {
  const { slug } = useParams();
  const plan = useSelector((state) => {
    let sel = state.plan.plans.filter((plan) => plan.slug === slug);
    if (sel.length > 0) {
      return sel[0];
    }
    return {};
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (!plan._id) {
      dispatch(getPlans());
    }
  }, []);

  return (
    <div className="container mx-auto my-4">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={3} className="text-center mt-5">
            Subscribe now!
          </Title>
        </Col>
        <Col span={24} key={plan._id} className="flex justify-center">
          <Card className="shadow-lg max-w-md">
            <div>
              <Title level={4}>{plan.name}</Title>
              <Text type="secondary" className="word-break">
                {plan.description}
              </Text>
            </div>
            <Divider />
            {plan.price > 0 && (
              <Title level={3}>
                ${plan.price}
                <Text type="secondary">/month</Text>
              </Title>
            )}
            {plan.price == 0 && <Title level={3}>Free</Title>}
            {plan.services &&
              plan.services.map((service, index) => (
                <div className="my-2" key={index}>
                  <CheckCircleTwoTone />{" "}
                  <span className="text-lg">{service}</span>
                </div>
              ))}
            <div className="mt-4">
              <Elements stripe={stripePromise} nonce="random-nonce">
                <CheckoutForm plan={plan} />
              </Elements>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Lists;
