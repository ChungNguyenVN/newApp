import React, { Component } from 'react';
import SimpleBar from "simplebar-react";

import {  Row, Col, Card, CardBody,Media, CardHeader, CardTitle, CardText, Input, Table, Label, Modal } from "reactstrap";

class ActivityHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_xHistorylarge: false
        };
        this.tog_History = this.tog_History.bind(this);
    }

    removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    tog_History() {
        this.setState(prevState => ({
            modal_xHistorylarge: !prevState.modal_xHistorylarge
        }));
        this.removeBodyCss();
    }

    render() {
        return (
            <React.Fragment>
                <Card>
                    <CardHeader className="bg-transparent">
                        <h5 className="my-2"><i className="fa fa-history  mr-2 align-middle" ></i>Lịch sử phê duyệt</h5>
                    </CardHeader>
                    <CardBody>
                        
                        <ul className="verti-timeline list-unstyled">
                            <li className="event-list">
                                <div className="event-timeline-dot">
                                    <i className="fa fa-arrow-circle-o-right"></i>
                                </div>
                                <Media>
                                    <div className="mr-3">
                                        <h5 className="font-size-14">22/06/2020 <i className="fa fa-long-arrow-right font-size-16 text-primary align-middle ml-2"></i></h5>
                                    </div>
                                    <Media body>
                                        <h4 className="font-size-15">Người xử lý</h4>
                                        <p>Nguyễn Hoàng Giang</p>
                                    </Media>
                                </Media>
                            </li>

                            <li className="event-list">
                                <div className="event-timeline-dot">
                                    <i className="fa fa-arrow-circle-o-right"></i>
                                </div>
                                <Media>
                                    <div className="mr-3">
                                        <h5 className="font-size-14">23/06/2020 <i className="fa fa-long-arrow-right font-size-16 text-primary align-middle ml-2"></i></h5>
                                    </div>
                                    <Media body>
                                        <h4 className="font-size-15">Người xử lý</h4>
                                        <p>Nguyễn Hoàng Giang</p>
                                    </Media>
                                </Media>
                            </li>
                            <li className="event-list active">
                                <div className="event-timeline-dot">
                                    <i className="fa fa-arrow-circle-o-right text-primary font-size-18 bx-fade-right"></i>
                                </div>
                                <Media>
                                    <div className="mr-3">
                                        <h5 className="font-size-14">24/06/2020 <i className="fa fa-long-arrow-right font-size-16 text-primary align-middle ml-2"></i></h5>
                                    </div>
                                    <Media body>
                                        <h4 className="font-size-15">Người xử lý</h4>
                                        <p>Nguyễn Thu Thủy</p>
                                    </Media>
                                </Media>
                            </li>
                            <li className="event-list">
                                <div className="event-timeline-dot">
                                    <i className="fa fa-arrow-circle-o-right"></i>
                                </div>
                                <Media>
                                    <div className="mr-3">
                                        <h5 className="font-size-14">25/06/2020 <i className="fa fa-long-arrow-right font-size-16 text-primary align-middle ml-2"></i></h5>
                                    </div>
                                    <Media body>
                                        <h4 className="font-size-15">Người xử lý</h4>
                                        <p>Nguyễn Văn Hoàng</p>
                                    </Media>
                                </Media>
                            </li>
                        </ul>
                        <div className="text-center mt-4">
                            <button 
                                className="btn btn-primary waves-effect waves-light btn-sm"
                                type="button"
                                onClick={this.tog_History}
                                data-toggle="modal"
                                data-target=".bs-example-modal-lg"
                            >
                                Chi tiết <i className="fa fa-arrow-circle-o-right ml-1"></i>
                            </button>
                        </div>
                        <Modal
                            size="xl"
                            isOpen={this.state.modal_xHistorylarge}
                            toggle={this.tog_History}
                            >
                            <div className="modal-header">
                                <h5
                                    className="modal-title mt-0 text-primary"
                                    id="myLargeModalLabel"
                                    >
                                    Lịch sử phê duyệt
                                </h5>
                                <button
                                    onClick={() =>
                                        this.setState({ modal_xHistorylarge: false })
                                    }
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="table-responsive">
                                    <Table className="table table-striped mb-3">
                                        <thead>
                                            <tr>
                                                <th>Người yêu cầu</th>
                                                <th>Người xử lý</th>
                                                <th>Tên bước</th>
                                                <th>Thời gian bắt đầu</th>
                                                <th>Thời gian hoàn thành</th>
                                                <th>SLA</th>
                                                <th>SLA thực tế</th>
                                                <th>Lý do</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Đặng Thu Hà</td>
                                                <td>Nguyễn Hoàng Giang</td>
                                                <td>
                                                    NSDX
                                                </td>
                                                <td>11/06/2020</td>
                                                <td>
                                                    12/06/2020
                                                </td>
                                                <td>
                                                    0
                                                </td>
                                                <td>
                                                    1
                                                </td>
                                                <td>
                                                    Không
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Đặng Thu Trang</td>
                                                <td>Nguyễn Hoàng Hà</td>
                                                <td>
                                                    HCNS
                                                </td>
                                                <td>11/06/2020</td>
                                                <td>
                                                    12/06/2020
                                                </td>
                                                <td>
                                                    0
                                                </td>
                                                <td>
                                                    1
                                                </td>
                                                <td>
                                                    Có
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Trần Thanh Huyền</td>
                                                <td>Nguyễn Văn Linh</td>
                                                <td>
                                                    HCNS
                                                </td>
                                                <td>11/06/2020</td>
                                                <td>
                                                    12/06/2020
                                                </td>
                                                <td>
                                                    0
                                                </td>
                                                <td>
                                                    1
                                                </td>
                                                <td>
                                                    Có
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="text-center mt-3 col-lg-12">
                                    <button type="button" className="btn btn-primary btn-md waves-effect waves-light"
                                        onClick={() =>
                                            this.setState({ modal_xHistorylarge: false })
                                        }
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        > Đóng
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default ActivityHistory;