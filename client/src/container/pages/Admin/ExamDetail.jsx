import React, { useState, useEffect, useRef, Fragment } from "react";
import { Col, Image, Layout, Row, Typography, Menu, Radio, Modal, InputNumber, Space, Button, Spin, Flex, Progress } from "antd";
import '../../.././SyncScroll.css';
import { getExamProblems } from "../../../services/problemAPI";
import { useParams } from "react-router-dom";

const { Content } = Layout;


const getProblems = async (id) => {
  try {
    const res = await getExamProblems({ _id: id });
    return res.data.exam.problems;
  } catch (err) {
    console.log('Error fetching problems:', err);
    return [];
  }
};

const ExamDetail = () => {
  const { id } = useParams();
  const [problems, setProblems] = useState([]);
  const [activeProblem, setActiveProblem] = useState('');
  const problemRefs = useRef({});
  const [examProblems, setExamProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const examProblemsResponse = await getProblems(id);
      setExamProblems(examProblemsResponse);
    };
    fetchProblems();
  }, [id]);
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

  const calcProblemIndex = (data, index) => {
    let count = 0;
    for (let i = 1; i <= index; i++) {
      let subData = data[`Section ${i}`];
      count += subData.length;
    }
    return count;
  }

  const handleMenuClick = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

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
                  disabled
                  value={examProblems[index].result - 1}
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
                        {i + 1 == examProblems[index].cor_answer ? (
                          <img
                            cl
                            decoding="async"
                            src="https://pilotinstitute.com/wp-content/themes/pilotinstitute/dist/images/YES_ICON_f0dfb1cb.png"
                          ></img>
                        ) : (
                          <></>
                        )}
                        {i + 1 != examProblems[index].cor_answer ? (
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
                {(
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
    </Content>
  );
}

export default ExamDetail;
