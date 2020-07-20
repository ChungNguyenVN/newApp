import React, { Component } from 'react';
import { Col, Card,CardHeader, CardBody, CardTitle, Row } from "reactstrap";

import "./progress.scss";

class ProgressWF extends Component {
    render() {
        return (
            <React.Fragment>
                
                <Card>
                    <CardHeader className="bg-transparent">
                        <Row>
                            <Col lg="6">
                                <h5 className="my-0">Luồng trạng thái</h5>
                            </Col>
                            <Col lg="6">
                                <div className="button-items mt-3 mb-3 text-right">
                                    <button className="waves-effect btn btn-success btn-sm waves-light">
                                        <i className="fa fa-check-square-o font-size-16 mr-2 align-middle"></i> Hoàn thành
                                    </button>
                                    <button className="waves-effect btn btn-warning btn-sm waves-light">
                                        <i className="fa fa-clock-o font-size-16 mr-2 align-middle"></i>Đang xử lý
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        
                        <ul className="step-menu">
                            <li role="button" className="complete">
                                HCNS
                                <span className="nameProgress">
                                    Đặng Thị Thu Hà
                                </span>
                            </li>
                            <li role="button" className="complete">
                                TP/TBP
                                <span className="nameProgress">
                                    DemoAccount
                                </span>
                            </li>
                            <li role="button" className="complete">
                                KTT
                                <span className="nameProgress">
                                    DemoAccount
                                </span>
                            </li>
                            <li role="button" className="current">
                                GĐTC
                                <span className="nameProgress">
                                    KSBN
                                </span>
                            </li>
                            <li role="button">
                                ABCDE
                                <span className="nameProgress">
                                    
                                </span>
                            </li>
                            <li role="button">
                                DEAA
                                <span className="nameProgress">
                                    
                                </span>
                            </li>
                            <li role="button">
                                SHIELD
                                <span className="nameProgress">
                                    
                                </span>
                            </li>
                        </ul>
                    </CardBody>
                </Card>
                                    
            </React.Fragment>
        );
    }
}

export default ProgressWF;