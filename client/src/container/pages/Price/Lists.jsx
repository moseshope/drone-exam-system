import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Button, Card, Col, Divider, Row, Typography } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { getPlans } from '../../../redux/plan/planSlice';
import { createSubscription, getUserSubscription } from '../../../services/planAPI';
import { getPlanSuccess } from '../../../redux/auth/authSlice';

const { Title, Text } = Typography;

function Lists() {

  const plans = useSelector(state => state.plan.plans ?? []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [actSub, setActSub] = useState({});
  const [selSub, setSelSub] = useState({});

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(getPlans());
    }
    getUserSubscription().then(res => {
      setActSub(res.data.activeSubscription ?? {});
      setSelSub(res.data.selectedSubscription ?? {});
    });
  }, []);

  const handleClick = async (id) => {
    await createSubscription({
      planId: id,
    });
    dispatch(getPlanSuccess({plan: {}}));
    navigate('/home');
  }

  return (
    <div className='container mx-auto my-4'>
      <Row align='stretch' justify='center' gutter={[16, 16]}>
        <Col span={24}>
          <Title level={3} className='text-center mt-5 m-4'>
            Find the perfect plan for your team, or try it for free!
          </Title>
        </Col>
        {plans.map(({
          _id, name, slug, description, price
        }) => (
          <Col span={22} md={12} lg={6}  key={_id} className='!p-2 price-card'>
            <Card className='shadow-lg w-full h-full'>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <Title level={4}>
                    {name}
                  </Title>
                  <Text type='secondary' className='word-break'>{description}</Text>
                </div>
                <Divider />
                {price > 0 && <Title level={3}>${price}<Text type='secondary'>/month</Text></Title>}
                {/* {price == 0 && <Title level={3}>Free</Title>}
                {services.map((service, index) => (
                  <div className='my-2' key={index}>
                    <CheckCircleTwoTone /> <span className='text-lg'>{service}</span>
                  </div>
                ))} */}
                <div className="mt-4 text-center">
                  {actSub?.planId?._id == _id && <div>
                    <span className='text-[15px] cursor-default'>Current Plan</span> <br />
                    {selSub?.planId && <span className='text-blue-500 cursor-pointer' onClick={() => handleClick(_id)}>Continue this plan</span>}
                    {!selSub?.planId && <span className='text-gray-500 cursor-default'>Renew at {moment(actSub?.next_payment_at).format('MM/DD/YY')}</span>}
                  </div>}
                  {selSub?.planId?._id == _id && <div><span className='text-[15px] cursor-default'>Selected Plan</span> <br /> 
                  <span className='text-gray-500 cursor-default'>Start at {moment(selSub?.next_payment_at).format('MM/DD/YY')}</span>
                  </div>}
                  {(actSub?.planId?._id != _id && selSub?.planId?._id != _id) && <Button size='large' type="primary" block onClick={() => {
                    if(price > 0) {
                      navigate(`/plans/${slug}`);
                    } else {
                      handleClick(_id);
                    }
                  }}>{!actSub._id ? 'Get Started' : (actSub.planId?.price > price ? 'Downgrade' : 'Upgrade')}</Button>}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div >
  )
}

export default Lists;