import React, { Component } from 'react';
import { Row, Col, Card,CardHeader, CardBody } from "reactstrap";
import { Link } from "react-router-dom";

import ReactApexChart from 'react-apexcharts';

class Earning extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: [
                { title: "Week", linkto: "#", isActive: false },
                { title: "Month", linkto: "#", isActive: false },
                { title: "Year", linkto: "#", isActive: true }
            ],
            series: [
                {name:"series1",data:[31,40,36,51,49,72,69,56,68,82,68,76]}
            ],
            options : {
                chart: { 
                    toolbar:"false",
                    dropShadow: { 
                        enabled:!0,
                        color:"#000",
                        top:18,
                        left:7,
                        blur:8,
                        opacity:.2
                    }
            },
            dataLabels: {
                enabled:!1
            },
            colors:["#556ee6"],
            stroke: {
                curve:"smooth",
                width:3
            }
        }
        };
    }
    
    render() {
        return (
            <React.Fragment>
                
                <Card>
                    <CardHeader className="bg-transparent clearfix">
                        <h5 className="my-2 float-sm-left">Thống kê SLA</h5>
                        <div className="float-sm-right">
                            <ul className="nav nav-pills">
                                {
                                    this.state.email.map((mail, key) =>
                                        <li className="nav-item" key={"_li_" + key}>
                                            <a className={mail.isActive ? "nav-link active" : "nav-link"} to={mail.linkto}>{mail.title}</a>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                        {/* <div className="clearfix"></div> */}
                    </CardHeader>
                        <CardBody>
                            <div className="clearfix">
                                {/*<div className="float-right">
                                     <div className="input-group input-group-sm">
                                        <select className="custom-select custom-select-sm">
                                            <option defaultValue>Tháng 01</option>
                                            <option value="1">Tháng 02</option>
                                            <option value="2">Tháng 03</option>
                                            <option value="3">Tháng 04</option>
                                        </select>
                                        <div className="input-group-append">
                                            <label className="input-group-text">Tháng</label>
                                        </div>
                                    </div> 
                                </div>*/}
                                
                            </div>

                            <Row>
                                <Col lg="4">
                                    <div className="text-muted">
                                        <div className="mb-4">
                                            <p>Trong tháng này</p>
                                            <h4>212</h4>
                                            <div>
                                                <span className="badge badge-soft-success font-size-12 mr-1"> + 0.2% </span> Tăng với tháng trước
                                            </div>
                                        </div>

                                        <div>
                                            <a to="#" className="btn btn-primary waves-effect waves-light btn-sm text-white">Chi tiết 
                                                <i className="fa fa-long-arrow-right ml-1"></i>
                                            </a>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <p className="mb-2">Tháng trước</p>
                                            <h5>190</h5>
                                        </div>
                                        
                                    </div>
                                </Col>

                                <Col lg="8">
                                    <div id="line-chart" className="apex-charts" dir="ltr">
                                        <ReactApexChart series={this.state.series} options={this.state.options} type="line" height={320} />
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                
            </React.Fragment>
        );
    }
}

export default Earning;