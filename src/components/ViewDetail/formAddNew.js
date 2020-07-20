import React, { Component } from 'react';
import {  Row, Col, Card,CardHeader, CardBody, CardTitle, CardText } from "reactstrap";
import Breadcrumbs from '../Breadcrumb/Breadcrumb';
class AddNew extends Component {
    constructor(props) {
        super(props);
        this.state = { customchk: true };
    }
    render(){
        return(
            <React.Fragment>
                <Breadcrumbs title="Trang chủ" breadcrumbItem="Tạo mới qui trình" className="mt-5" />
                <Card>
                    <CardHeader className="bg-transparent">
                        <h5 className="my-2">Đề xuất mua hàng</h5>
                        <CardText>Đề xuất nâng cấp hệ thống <span className="text-danger">TSG</span> ngoài kế hoạch</CardText>
                    </CardHeader>
                    <CardBody>
                        
                        <Row>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label"> Tiêu đề<span className="text-danger">*</span>:</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="text" defaultValue="" placeholder="Nhập tiêu đề"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label"> Số hệ thống<span className="text-danger">*</span>:</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="number" defaultValue="" placeholder="Số hệ thống"/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Khẩn cấp</label>
                                    <div className="col-md-8">
                                        <div className="custom-control custom-checkbox form-control border-0">
                                            <input type="checkbox" className="custom-control-input" id="CustomCheck1" onChange={() => false} checked={this.state.customchk} />
                                            <label className="custom-control-label" onClick={() => { this.setState({ customchk: !this.state.customchk }) }} >Có/Không</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label"> Ngày yêu cầu<span className="text-danger">*</span>:</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Loại liên kết</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label"> Bộ phận yêu cầu<span className="text-danger">*</span>:</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Hình thức thanh toán</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label"> Chuyên môn<span className="text-danger">*</span>:</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Loại liên kết</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Hiệu quả<span className="text-danger">*</span>:</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="text" defaultValue="" placeholder="Hiệu quả"/>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Người phê duyệt<span className="text-danger">*</span>:</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="text" defaultValue="DemoAccount" placeholder=""/>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Chuyển bước</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">SLA thực tế<span className="text-danger">*</span>:</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="number" defaultValue="DemoAccount" placeholder=""/>
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

                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-2 col-form-label">Tài liệu đính kèm</label>
                                    <div className="col-md-10">
                                        <button className="waves-effect btn btn-info btn-sm waves-light">
                                            <i className="fa fa-paperclip mr-2 align-middle text-white font-size-16"></i> Thêm tập tin
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-12">
                                <div className="button-items mt-2 mb-2 text-center">
                                    <button className="waves-effect btn btn-warning btn-md waves-light">
                                        <i className="fa fa-floppy-o mr-1 align-middle text-white font-size-14"></i>Lưu
                                    </button>
                                    <button href=""className="waves-effect btn btn-success btn-md waves-light">
                                        <i className="fa fa-paper-plane-o mr-1 align-middle text-white font-size-14"></i>Gửi đi
                                    </button>
                                    <button href=""className="waves-effect btn btn-secondary btn-md waves-light">
                                        <i className="fa fa-refresh mr-1 align-middle text-white font-size-14"></i>Làm mới
                                    </button>
                                    <button href=""className="waves-effect btn btn-primary btn-md waves-light">
                                        <i className="fa fa-step-forward mr-1 align-middle text-white font-size-146"></i>Chuyển bước
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
export default AddNew;