import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input, Radio, message } from "antd";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { createSubscription } from "../../../../services/planAPI";
import { getPlanSuccess } from "../../../../redux/auth/authSlice";

function CheckoutForm({ plan }) {
  // stripe items
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(() => {
    if (user.pm_last_four) {
      return 1;
    } else {
      return 2;
    }
  });

  // main function
  const handleCreateSubscription = async () => {
    try {
      setLoading(true);
      // create a payment method
      let paymentMethod;
      if (value === 2) {
        paymentMethod = await stripe?.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email,
          },
        });
      }
      
      // call the backend to create subscription
      const response = await createSubscription({
        paymentMethod: paymentMethod?.paymentMethod?.id,
        planId: plan._id,
        pm_type: paymentMethod?.paymentMethod?.card.brand,
        pm_last_four: paymentMethod?.paymentMethod?.card.last4,
      });

      let confirmPayment;
      if (response.data.clientSecret) {
        confirmPayment = await stripe?.confirmCardPayment(
          response.data.clientSecret
        );
      }

      if (confirmPayment?.error) {
        message.error(confirmPayment.error.message);
      } else {
        message.info("Subscribed successfully!");
        dispatch(getPlanSuccess({ plan: {} }));
        navigate("/home");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      }
    }
  };

  const onChange = (e) => {
    // console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  return (
    <div className="grid gap-4 m-auto">
      {user.pm_last_four && (
        <div>
          <Radio.Group onChange={onChange} value={value}>
            <Radio value={1}>Use old card</Radio>
            <Radio value={2}>Use new Card</Radio>
          </Radio.Group>
        </div>
      )}
      {value == 2 && (
        <CardElement className="border border-solid border-gray-400 py-3 px-4 rounded" />
      )}
      <Button
        loading={loading}
        size="large"
        type="primary"
        onClick={handleCreateSubscription}
        disabled={!stripe}
      >
        Subscribe
      </Button>
    </div>
  );
}

export default CheckoutForm;
