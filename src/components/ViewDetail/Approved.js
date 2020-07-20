import React, { Component } from 'react';
import {  Row, Col, Card,CardHeader, CardBody, CardTitle, CardText, Input } from "reactstrap";

class Approve extends Component {
    render(){
        return (
            <React.Fragment>
                <Card>
                    <CardHeader className="bg-transparent">
                        <h5 className="my-2">Phê duyệt</h5>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-3 col-form-label">Lý do</label>
                                    <div className="col-md-9">
                                        <Input
                                            type="textarea"
                                            id="textarea"
                                            onChange={this.textareachange}
                                            maxLength="225"
                                            rows="3"
                                            placeholder="Nhập lý do"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-6 col-form-label">Người phê duyệt tiếp theo</label>
                                    <div className="col-md-6">
                                        <input className="form-control" type="text" defaultValue="DemoAcc" placeholder=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-6 col-form-label">Giao lại cho người khác</label>
                                    <div className="col-md-6">
                                        <input className="form-control" type="text" defaultValue="" placeholder="Tìm kiếm người dùng"/>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-6 col-form-label">Chuyển bước</label>
                                    <div className="col-md-6">
                                        <input className="form-control" type="text" defaultValue="DemoAcc" placeholder=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-6 col-form-label">Người xử lý tại chuyển bước</label>
                                    <div className="col-md-6">
                                        <input className="form-control" type="text" defaultValue="" placeholder="Tìm kiếm người dùng"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="button-items mt-2 mb-2 text-center">
                                    <button className="waves-effect btn btn-info btn-md waves-light">
                                        <i className="fa fa-paperclip mr-1 align-middle text-white font-size-14"></i>Thêm tập tin
                                    </button>
                                    <button href=""className="waves-effect btn btn-success btn-md waves-light">
                                        <i className="fa fa-check mr-1 align-middle text-white font-size-14"></i>Phê duyệt
                                    </button>
                                    <button href=""className="waves-effect btn btn-warning btn-md waves-light">
                                        <i className="fa fa-chevron-left mr-1 align-middle text-white font-size-14"></i>Giao lại
                                    </button>
                                    <button href=""className="waves-effect btn btn-danger btn-md waves-light">
                                        <i className="fa fa-ban mr-1 align-middle text-white font-size-14"></i>Từ chối
                                    </button>
                                    <button href=""className="waves-effect btn btn-primary btn-md waves-light">
                                        <i className="fa fa-chevron-right mr-1 align-middle text-white font-size-146"></i>Chuyển bước
                                    </button>
                                </div>
                            </div>
                        </Row>
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default Approve;