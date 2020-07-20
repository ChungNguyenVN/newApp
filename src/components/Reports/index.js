import React, { Component } from 'react';
import {  Row, Col, Card,CardHeader, CardBody, CardTitle, CardText, Input } from "reactstrap";

import Earning from '../Charts/earning';
import PieChart from '../Charts/PieChart';
import DatatableTables from '../Tables/DatatableTables';
class Report extends Component {
    render(){
        return (
            <React.Fragment>
                <Card>
                    <CardHeader className="bg-transparent">
                        <h5 className="my-2">Thống kê yêu cầu</h5>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-2 col-form-label">Tiêu đề</label>
                                    <div className="col-md-10">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Loại phiếu</label>
                                    <div className="col-md-8">
                                        <select className="form-control">
                                            <option>Chọn</option>
                                            <option>Large select</option>
                                            <option>Small select</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Qui trình</label>
                                    <div className="col-md-8">
                                        <select className="form-control">
                                            <option>Chọn</option>
                                            <option>Large select</option>
                                            <option>Small select</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Người tạo</label>
                                    <div className="col-md-8">
                                        <select className="form-control">
                                            <option>Chọn</option>
                                            <option>Large select</option>
                                            <option>Small select</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Trạng thái</label>
                                    <div className="col-md-8">
                                        <select className="form-control">
                                            <option>Chọn</option>
                                            <option>Large select</option>
                                            <option>Small select</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Từ ngày</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Đến ngày</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-12">
                                <div className="button-items mt-3 mb-3 text-center">
                                    <button className="waves-effect btn btn-primary btn-md waves-light">
                                        <i className="fa fa-search mr-2 align-middle text-white font-size-16"></i> Lọc danh sách
                                    </button>
                                    <button href=""className="waves-effect btn btn-secondary btn-md waves-light">
                                        <i className="fa fa-refresh mr-2 align-middle text-white font-size-16"></i> Làm mới
                                    </button>
                                </div>
                            </div>

                            

                            
                            
                        </Row>
                    </CardBody>
                </Card>

                {/* Chart */}
                <Row>
                    <Col lg="6">
                        <Earning/>
                    </Col>
                    <Col lg="6">
                        <PieChart/>
                    </Col>
                    <Col lg="12">
                        <DatatableTables></DatatableTables>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}
export default Report;