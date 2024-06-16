import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, message, Typography, Radio, Divider, Input } from "antd";
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getUser } from "../../../../redux/auth/authSlice";
import { createSetupIntent, createSubscription } from "../../../../services/planAPI";

const { Title } = Typography;

function PayModal({ open, setOpen, price, planId, setSuccessful }) {

  const cardNumberRef = useRef();
  const cardExpiryRef = useRef();
  const cardCvcRef = useRef();

  // stripe items
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const errors = useSelector((state) => state.auth.errors);
  const [cardType, setCardType] = useState(1);

  const [cardError, setCardError] = useState({});
  const [loading, setLoading] = useState(false);
  // const [value, setValue] = useState(() => {
  //   if (user.pm_last_four) {
  //     return 1;
  //   } else {
  //     return 2;
  //   }
  // });

  // main function
  const handleAddPaymentMethod = async () => {
    try {
      setLoading(true);
      // create a payment method
      let paymentMethod;
      if (!user.pm_last_four || (user.pm_last_four && cardType === 2)) {
        paymentMethod = await stripe?.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email,
          },
        });

        if (paymentMethod?.error) {
          console.log(paymentMethod.error);
          setCardError({
            ...cardError,
            [paymentMethod.error.code.replace('incomplete_', '')]: paymentMethod.error.message
          });
          setLoading(false);
          return;
        }

      }

      const response = await createSetupIntent();
      let res = {};
      if (!user.pm_last_four && paymentMethod?.paymentMethod?.id) {
        res = await stripe.confirmCardSetup(response.data.clientSecret, {
          payment_method: paymentMethod?.paymentMethod?.id,
        });
        // console.log('============================here=========================');
      }
      const { setupIntent, error } = res;
      if (error) {
        console.log(error, '---------------------');
        // setCardError({
        //   ...cardError,
        //   number: error.message
        // });
        setLoading(false);
        return message.error(error.message);
      }

      let { data } = await createSubscription({
        paymentMethod: paymentMethod?.paymentMethod?.id,
        pm_type: paymentMethod?.paymentMethod?.card.brand,
        pm_last_four: paymentMethod?.paymentMethod?.card.last4,
        customerId: response.data.customerId,
        planId,
      });
      if (data.clientSecret) {
        const res1 = await stripe.confirmCardPayment(data.clientSecret);
        if (res1.error) {
          console.log(res1.error, '---------------------');
          // setCardError(res1.error.message);
          setLoading(false);
          return message.error(res1.error.message);
        }
      }
      /* let res = await sendNow({
        path,
      }); */

      // let paymentId = paymentIntent.id;

      // window.gtag('event', 'conversion', {
      //   'send_to': 'AW-11469018582/7t47CKHFiY4ZENar7dwq',
      //   'transaction_id': paymentId,
      // });
      // console.log(response);

      dispatch(getUser());
      setOpen(false);
      setLoading(false);
      message.success("Successfully subscribed!");
      // setSuccessful(true);
      // setTimeout(() => {
      //   navigate("/restore");
      // }, 1000);
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

  useEffect(() => {
    // if (user.planId) {
    //   navigate("/restore");
    // }
    // console.log(user);
  }, [user]);

  return (
    <Modal
      className="shadow-lg my-2"
      width={460}
      title={<div className="text-center"><Title level={3} className="!mb-1">{user.pm_last_four ? "Basic" : "7 Day Free Trial"}</Title> <Title level={5} className="!m-0">Beta Pricing: Only ${price} / Month</Title></div>}
      open={open}
      centered
      footer={[]}
      maskClosable={false}
      styles={{
        mask: { background: "#000d"}
      }}
      onCancel={() => setOpen(false)}
    >
      <div className="grid gap-2 m-auto">
        {/* <div className="max-w-2xl my-3 md:my-5 mx-auto text-center">
          <h2 className="text-xl font-bold md:text-2xl lg:text-3xl text-black whitespace-pre-wrap">
            Over <span className="text-primary">251,819+</span> Photos Restored
            For <span className="text-primary">31,489</span> Happy Customers
          </h2>
        </div> */}
        <div className="grid gap-2 px-4">
          {user.pm_last_four && (
            <Radio.Group
              onChange={(e) => {
                setCardType(e.target.value);
                setCardError({});
              }}
              value={cardType}
            >
              <Radio value={1}>Use Old Card</Radio>
              <Radio value={2}>Use New Card</Radio>
            </Radio.Group>
          )}
          {(cardType === 1 && user.pm_last_four) && (
            <div className="mt-2">
              <Input size="large" readOnly value={`* * * *  * * * *  * * * *  ${user.pm_last_four}`} />
            </div>
          )}

          {(cardType === 2 || !user.pm_last_four) && (
            <>
              {/* <CardElement
                className="border border-solid border-gray-400 py-3 px-4 rounded bg-white mt-4"
                onChange={(event) => {
                  if (event.error) {
                    setCardError(event.error.message);
                  } else {
                    setCardError(null);
                  }
                }}
              /> */}
              <CardNumberElement
                className="border border-solid border-gray-400 py-3 px-4 rounded bg-white mt-4"
                onChange={(event) => {
                  if (event.error) {
                    setCardError({ ...cardError, number: event.error.message });
                  } else {
                    setCardError({
                      ...cardError,
                      number: null,
                    });
                  }
                  if (event.complete) {
                    cardExpiryRef.current.focus();
                  }
                }}
                onReady={(element) => (cardNumberRef.current = element)}
              />
              {cardError.number && (
                <div className="text-sm text-red-500">{cardError.number}</div>
              )}
              <div className="flex flex-wrap justify-between">
                <div className="w-[50%]">
                  <CardExpiryElement
                    className="border border-solid border-gray-400 py-3 px-4 rounded bg-white mt-4"
                    onChange={(event) => {
                      if (event.error) {
                        setCardError({ ...cardError, expiry: event.error.message });
                      } else {
                        setCardError({
                          ...cardError,
                          expiry: null,
                        });
                      }
                      if (event.complete) {
                        cardCvcRef.current.focus();
                      } else if (event.empty) {
                        cardNumberRef.current.focus();
                      }
                    }}
                    onReady={(element) => (cardExpiryRef.current = element)}
                  />
                  {cardError.expiry && (
                    <div className="text-sm text-red-500">{cardError.expiry}</div>
                  )}
                </div>
                <div className="w-[40%]">
                  <CardCvcElement
                    className="border border-solid border-gray-400 py-3 px-4 rounded bg-white mt-4"
                    onChange={(event) => {
                      if (event.error) {
                        setCardError({ ...cardError, cvc: event.error.message });
                      } else {
                        setCardError({
                          ...cardError,
                          cvc: null,
                        });
                      }
                      if (event.empty) {
                        cardExpiryRef.current.focus();
                      }
                    }}
                    onReady={(element) => (cardCvcRef.current = element)}
                  />
                  {cardError.cvc && (
                    <div className="text-sm text-red-500">{cardError.cvc}</div>
                  )}
                </div>
              </div>
            </>
          )}

          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            className="mt-4"
            disabled={!stripe || cardError.number || cardError.exp || cardError.cvc}
            size="large"
            onClick={handleAddPaymentMethod}
          >
            {user.pm_last_four ? "Subscribe" : "Start Trial"}
          </Button>
          <p className="text-center text-gray-500 my-2 italic">Cancel at Anytime</p>
        </div>
        <Divider className="mt-0"></Divider>
        <div className="flex items-center">
          <img src="/imgs/Lady.png" alt="User" className="w-28 pr-4" />
          <div className="flex-1">
            <p className="mb-2">"I honestly can't believe it's only $15 a month. I've gotten at least $500 worth of value within the first 20 minutes of using Concept."</p>
            <p className="m-0 font-bold">- Taylor Hewitt, CEO @ Andine</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PayModal;
