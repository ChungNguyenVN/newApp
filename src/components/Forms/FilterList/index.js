import React, { Component } from "react";

import { Row, Col, Card, CardHeader, CardBody, CardTitle, Container, Modal, Button } from "reactstrap";
import {Table, Thead, Tbody, Tr, Th, Td} from 'react-super-responsive-table';


class Filter extends Component { 
    constructor(props) {
        super(props);
        this.state = {
          
        };
    }
    render() {
        return(
            <React.Fragment>
                <Card>
                    <CardHeader className="bg-transparent">
                        <h5 className="my-2">Lọc danh sách</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="row mb-3">
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-3 col-form-label">Từ ngày</label>
                                    <div className="col-md-9">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-3 col-form-label">Đến ngày</label>
                                    <div className="col-md-9">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-3 col-form-label">Mã yêu cầu</label>
                                    <div className="col-md-9">
                                        <input className="form-control" type="text" defaultValue="R001" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-3 col-form-label">Loại yêu cầu</label>
                                    <div className="col-md-9">
                                        <input className="form-control" type="text" defaultValue="R001" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-3 col-form-label">Người trình</label>
                                    <div className="col-md-9">
                                        <input className="form-control" type="text" defaultValue="R001" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="button-items mt-3 mb-3 text-center">
                                    <button className="waves-effect btn btn-primary btn-md waves-light">
                                        <i className="fa fa-filter mr-2 align-middle text-white font-size-16"></i> Lọc danh sách
                                    </button>
                                    <button href=""className="waves-effect btn btn-danger btn-md waves-light">
                                        <i className="fa fa-trash mr-2 align-middle text-white font-size-16"></i> Xóa bộ lọc
                                    </button>
                                </div>
                            </div>
                            {/* listView */}
                            <div className="col-lg-12 mb-3">
                                <CardTitle>
                                    <h5 className="text-info mb-3">
                                        Danh sách hồ sơ
                                    </h5>
                                </CardTitle>
                                <div className="table-responsive">
                                    <Table className="table table-striped mb-3">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Mã yêu cầu</th>
                                                <th>Loại yêu cầu</th>
                                                <th>Người trình</th>
                                                <th>Phòng ban</th>
                                                <th>Đơn vị</th>
                                                <th>Số tiền đề nghị</th>
                                                <th>Đơn vị thụ hưởng</th>
                                                <th>Người duyệt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>TSG001</td>
                                                <td>Thanh toán</td>
                                                <td>
                                                    Đặng Thành Nam
                                                </td>
                                                <td>Phòng Kế toán</td>
                                                <td>
                                                    TSGACT
                                                </td>
                                                <td>
                                                    250,000,000
                                                </td>
                                                <td>
                                                    Giang Hoàng
                                                </td>
                                                <td>
                                                    Sơn Nguyễn
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>TSG001</td>
                                                <td>Thanh toán</td>
                                                <td>
                                                    Đặng Thành Nam
                                                </td>
                                                <td>Phòng Kế toán</td>
                                                <td>
                                                    TSGACT
                                                </td>
                                                <td>
                                                    250,000,000
                                                </td>
                                                <td>
                                                    Giang Hoàng
                                                </td>
                                                <td>
                                                    Sơn Nguyễn
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td>TSG001</td>
                                                <td>Thanh toán</td>
                                                <td>
                                                    Đặng Thành Nam
                                                </td>
                                                <td>Phòng Kế toán</td>
                                                <td>
                                                    TSGACT
                                                </td>
                                                <td>
                                                    250,000,000
                                                </td>
                                                <td>
                                                    Giang Hoàng
                                                </td>
                                                <td>
                                                    Sơn Nguyễn
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <nav aria-label="...">
                                        <ul className="pagination justify-content-center">
                                            <li className="page-item disabled">
                                                <a className="page-link" href="#" tabIndex="-1">Sau</a>
                                            </li>
                                            <li className="page-item">
                                                <a className="page-link" href="#">1 <span className="sr-only">(current)</span></a>
                                                </li>
                                            <li className="page-item active">
                                                <a className="page-link" href="#">2</a>
                                            </li>
                                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                                            <li className="page-item">
                                                <a className="page-link" href="#">Tiếp</a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            
                        </div>
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default Filter;