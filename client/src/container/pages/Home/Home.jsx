import React, { useState, useEffect, useRef, Fragment  } from "react";
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Image, Layout, Row, Typography,  Menu, Radio, Modal, InputNumber, Space, Button, Spin, Flex, Progress } from "antd";
import Icon, { DownloadOutlined } from '@ant-design/icons';
import { getStorage, setStorage } from "../../../helpers";
import '../../.././SyncScroll.css';
import { saveExam } from "../../../services/examAPI";
import { getProblems } from "../../../services/problemAPI";
import { getUserStatus } from "../../../services/userAPI";
import { checkLastStatus } from "../../../services/userAPI";
import { updateUserStatus } from "../../../services/userAPI";
import Certificate from "../../../components/Certificate";

const { Content } = Layout;


const getProblemsByLimit = async (limit) => {
  try {
    const res = await getProblems({limit: limit});
    return res.data;
  } catch (err) {
    console.log('Error fetching problems:', err);
    return [];
  }
};

const Home = () => {
  const maxTime = 7200;
  const [examStatus, setExamStatus] = useState(false);
  const [visibleStatus, setVisibleStatus] = useState(false);
  const [limit, setLimit] = useState(0);
  const [problems, setProblems] = useState([]);
  const [activeProblem, setActiveProblem] = useState('');
  const problemRefs = useRef({});
  const [examProblems, setExamProblems] = useState([]);
  const [timer, setTimer] = useState(maxTime);
  const [timerText, setTimerText] = useState('');
  const [timerVisible, setTimerVisible] = useState(false);
  const [score, setScore] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempLimit, setTempLimit] = useState(60);
  const [sectionLength, setSectionLength] = useState([]);
  const [userStatus, setUserStatus] = useState(false);
  const [username, setUsername] = useState('');

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    setUsername(user.name); // Assume you fetch user name and store it in state
  }, [user]);

  const generateCertificate = () => {
    if (username) {
      // Create a new element to mount the Certificate component
      const certComponent = document.createElement("div");
      certComponent.id = "cert-component";
      document.body.appendChild(certComponent);
  
      // Render the Certificate component into the newly created div
      ReactDOM.render(<Certificate userName={username} />, certComponent);
  
      // Optionally, remove the component after the download is triggered
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(certComponent);
        document.body.removeChild(certComponent);
      }, 5000); // Adjust timeout as necessary
    } else {
      console.log("Username not set. Cannot generate certificate.");
    }
  };

  useEffect(() => {
    if (limit > 0 && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000); // Decrease every second

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [limit, timer]);

  useEffect(() => {
    if (timer === 0) {
      // Timer has finished
      endExam();
    }
    setTimerText(calcTime(timer));
  }, [timer]);

  useEffect(() => {
    const fetchProblems = async () => {
      const examProblemsResponse = await getProblemsByLimit(limit);
      let tempProblems = [];
      examProblemsResponse.data.map((tempProblem, index) => {
        tempProblem.problems.map((temp) => {
          tempProblems.push(temp);
        });
      });
      setExamProblems(tempProblems);
    };
    if(parseInt(limit) == 60) {
      setTimerVisible(true);
    } else {
      setTimerVisible(false);
    }

    fetchProblems();
  }, [limit]);

  const getProblemsWithCategory = () => {
    let data = {};
    for (const problem of examProblems) {
      if (data[problem.category]) {
        data[problem.category].push(problem);
      } else {
        data[problem.category] = [problem];
      }
    }
    return [{ ...data }, Object.keys(data)];
  };

  useEffect(() => {
    if (Array.isArray(examProblems)) {
      // Ensure examProblems is an array
      setProblems(
        examProblems.map((_, index) => ({
          id: `problem${index + 1}`,
          label: `Question ${index + 1}`,
        })),
      );
    } else {
      console.error('Expected array but got:', examProblems);
    }
  }, [examProblems]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.8,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveProblem(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    problems.forEach((problem) => {
      if (problemRefs.current[problem.id]) {
        observer.observe(problemRefs.current[problem.id]);
      }
    });

    return () => {
      problems.forEach((problem) => {
        if (problemRefs.current[problem.id]) {
          observer.unobserve(problemRefs.current[problem.id]);
        }
      });
    };
  }, [problems]);

  useEffect(() => {
    checkUserStatus();
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const status = await checkLastStatus();
  };

  const checkUserStatus = async () => {
    try {
      const user = await getUserStatus();
      setUserStatus(user.data.data.certStatus);
      return user.data.data.certStatus;
    } catch (err) {
      console.log(err);
    }
  }

  const calcProblemIndex = (data, index) => {
    let count = 0;
    for(let i = 1; i <= index; i ++) {
      let subData = data[`Section ${i}`];
      count += subData.length;
    }
    return count;
  }

  const handleMenuClick = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  const calcTime = (time) => {
    let hour,
      min,
      second = 0;
    hour = Math.floor(time / 3600);
    min = Math.floor((time - hour * 3600) / 60);
    second = time - hour * 3600 - min * 60;

    if (hour == 0 && min == 0 && second == 0) {
      return 'The exam is finished!';
    }
    return hour + 'h ' + min + 'm ' + second + 's';
  };

  const calcScore = () => {
    let tempTotalScore = 0;
    let scorePerSection = new Array(5).fill(0);
    let len = new Array(5).fill(0);
    examProblems.map((examProblem) => {
      let index = parseInt(examProblem.category.match(/\d+/)[0]) - 1;
      if (examProblem.result == examProblem.cor_answer) {
        scorePerSection[index] += 1;
        tempTotalScore += 1;
      } else {
        scorePerSection[index] += 0;
      }
      len[index] += 1;
    });
    setSectionLength(len);
    let userScore = [];
    scorePerSection.map((sectionScore, index) => {
      userScore.push(Math.floor((sectionScore * 100) / len[index]));
    });
    setScore(scorePerSection);
    setTotalScore(tempTotalScore);
    userScore.push(Math.floor((tempTotalScore * 100) / limit));
    return userScore;
  };

  const startExam = () => {
    setLimit(parseInt(tempLimit));
    setVisibleStatus(false);
    if(tempLimit == 60) {
      setTimer(maxTime);
    } else {
      setTimer(99999999999999999);
    }
  };

  const saveExamination = async (score) => {
    try {
      if(parseInt(limit) == 60) {
        const res = saveExam({score: score, problems: examProblems});
      }
    } catch (err) {
      console.log(err);
    }
  }

  const endExam = async () => {
    if (!examStatus) {
      setExamStatus(true);
      let userScore = calcScore();
      setVisibleStatus(true);
      saveExamination(userScore);
      const lastStatus = await checkLastStatus();
      const uStatus = await checkUserStatus();
      if(uStatus == 0 && lastStatus.data.status) {
        let updateStatus = await updateUserStatus();
        setUserStatus(true);
      }
      setTimer(0);
      setModalOpen(true);
    }
  };

  const restartExam = () => {
    setLimit(0);
    setExamStatus(false);
    setModalOpen(false);
  };

  if (!limit) {
    return (
      <Content>
        <div className="px-5 wrapper">
          <div className="wrap flex items-center justify-center h-[100%]">
            <div className="w-[500px]">
              <h2>Welcome To Your Part 107 Practice Exam</h2>
              <div className="py-[20px] px-[30px] border border-solid">
                <Space className="mr-[30px]">
                  <label>The Number of Questions</label>
                  <InputNumber
                    min={10}
                    max={80}
                    defaultValue={60}
                    onChange={(value) => {
                      setTempLimit(value);
                    }}
                    size="large"
                  />
                </Space>
                <Button type="primary" onClick={() => startExam()} size="large">
                  Start Exam
                </Button>
              </div>
            </div>
          </div>
        </div>
        {userStatus == 1 ? <Button type="primary" onClick={() => generateCertificate()} className="fixed bottom-[160px] right-[25px]" shape="circle" icon={<DownloadOutlined />} size="large"></Button> : <></>}
      </Content>
    );
  } else {
    return (
      <Content>
        <div className="px-5">
          <div className="wrap">
            <nav className="side-menu">
              <ul>
                {getProblemsWithCategory()[1].map((key, index) => {
                  let subProblems = getProblemsWithCategory()[0][key];
                  return (
                    <Fragment key={key}>
                      <li className="text-black">* {key}</li>
                      {subProblems.map((prob, index1, items) => {
                        let count = calcProblemIndex(getProblemsWithCategory()[0], index);
                        return (
                          <li
                            key={`problem${count + index1 + 1}`}
                            className={
                              activeProblem === `problem${count + index1 + 1}`
                                ? 'active !pl-10 text-black'
                                : '!pl-10 text-black'
                            }
                          >
                            <button
                              onClick={() => handleMenuClick(`problem${count + index1 + 1}`)}
                            >{`Question ${count + index1 + 1}`}</button>
                          </li>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </ul>
            </nav>
            <div className="btn-group  w-[280px]">
              {timerVisible && (<><p className="timer text-center mb-3 text-xl">{limit && timerText}</p>
              <Progress
                percent={Math.floor((timer * 100) / maxTime)}
                size={[ 270, 10 ]}
                status="active"
                className="mb-5"
                showInfo={false}
              /></>)}
              <div className="flex justify-around">
                <Button type="primary" size="large" onClick={restartExam} className="finish mr-[20px]">
                  Restart Exam
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={endExam}
                  className="finish"
                  danger
                  disabled={timer == 0 ? true : false}
                >
                  Finish Exam
                </Button>
              </div>
            </div>
            <div className="content">
              {problems.map((problem, index) => (
                <div
                  key={problem.id}
                  id={problem.id}
                  ref={(el) => (problemRefs.current[problem.id] = el)}
                  className="problem text-black"
                >
                  <h2>{problem.label}</h2>
                  <p className="prob-content text-blue-700">{examProblems[index].prob_content}</p>
                  <Radio.Group
                    className=" w-full p-5 text-black"
                    onChange={(checkedValue) => {
                      setExamProblems((prev) => {
                        let tmp = [...prev];
                        tmp[index].result = checkedValue.target.value + 1;
                        return tmp;
                      });
                    }}
                  >
                    <Row>
                      {examProblems[index].avail_answers.map((availAnswer, i) => (
                        <Col span={24} className="w-full flex justify-between items-center text-black">
                          <Radio
                            value={i}
                            className=" select-answer w-full text-[25px] my-[20px] font-normal tracking-wide text-black"
                          >
                            {availAnswer}
                          </Radio>
                          {i + 1 == examProblems[index].cor_answer && visibleStatus ? (
                            <img
                              cl
                              decoding="async"
                              src="https://pilotinstitute.com/wp-content/themes/pilotinstitute/dist/images/YES_ICON_f0dfb1cb.png"
                            ></img>
                          ) : (
                            <></>
                          )}
                          {i + 1 != examProblems[index].cor_answer && visibleStatus ? (
                            <img
                              decoding="async"
                              src="https://pilotinstitute.com/wp-content/themes/pilotinstitute/dist/images/NO_ICON_ebefc5b7.png"
                            ></img>
                          ) : (
                            <></>
                          )}
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                  {visibleStatus && (
                    <div className="answer-explanation">
                      <h4 className="explanation-title">
                        <img
                          decoding="async"
                          src="https://pilotinstitute.com/wp-content/themes/pilotinstitute/dist/images/correct_answer_d2606ad2.png"
                          alt="Answer Explanation"
                        />
                        Correct Answer Explanation
                      </h4>
                      <p className="prob-correct-answer">{examProblems[index].cor_description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {
          <Modal
            title={Math.floor((totalScore * 100) / limit) >= 90 ? 'You’re ready for the FAA Exam!' : 'Try again!'}
            open={modalOpen}
            onOk={restartExam}
            onCancel={() => {
              setModalOpen(false);
            }}
            width={1024}
            // okButtonProps={{ disabled: false }}
            // cancelButtonProps={{ disabled: false }}
            styles={{
              header: {
                color: 'white',
              },
              body: {
                textAlign: 'center',
              },
            }}
            footer={[
              <Button key="back" type="primary" onClick={restartExam} size="large">
                Restart
              </Button>,
              <Button
                key="ok"
                type="primary"
                onClick={() => {
                  setModalOpen(false);
                }}
                size="large"
              >
                View Feedback
              </Button>,
            ]}
          >
            <div className="flex justify-between items-center mt-[30px]">
              {score.map((subScore, index) => (
                <div key={index}>
                  <p className="!text-[18px]">{`Section ${index + 1}`}</p>
                  <Progress className="mb-[20px]" type="dashboard" percent={Math.floor((subScore * 100) / sectionLength[index])} gapDegree={30} />
                  <p className="!text-[14px]">{`${subScore} out of ${sectionLength[index]} correct`}</p>
                </div>
              ))}
            </div>
            <div className="total-score">
              <p>Your total Score</p>
              <Progress className="mb-[20px]" type="dashboard" percent={Math.floor((totalScore * 100) / limit)} gapDegree={30} />
              <p className="!text-[14px]">{`${totalScore} out of ${limit} correct`}</p>
            </div>
          </Modal>
        }
      {userStatus == 1 ? <Button type="primary" onClick={() => generateCertificate()} className="fixed bottom-[160px] right-[25px]" shape="circle" icon={<DownloadOutlined />} size="large"></Button> : <></>}
      </Content>
    );
  }
};

export default Home;
