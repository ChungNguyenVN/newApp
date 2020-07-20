import React, { Component } from 'react';
import SimpleBar from "simplebar-react";

import {  Row, Col, Card, CardBody, CardHeader, CardTitle, CardText, Input, Table, Label, Modal } from "reactstrap";

class WfOption extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_wfOption: false
        };
        this.tog_Option = this.tog_Option.bind(this);
    }

    removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    tog_Option() {
        this.setState(prevState => ({
            modal_wfOption: !prevState.modal_wfOption
        }));
        this.removeBodyCss();
    }

    render(){
        return (
            <React.Fragment>
                <Card>
                    <CardHeader className="bg-transparent">
                        <Row className="mb-2">
                            <Col lg="6">
                                
                                <h5 className="my-2"><i className="fa fa-sliders mr-2 align-middle" ></i>Quy trình tùy chọn</h5>
                                
                            </Col>
                            <Col lg="6" className="text-right">
                                <button 
                                    className="btn btn-primary waves-effect waves-light btn-sm"
                                    type="button"
                                    onClick={this.tog_Option}
                                    data-toggle="modal"
                                    data-target=".bs-example-modal-lg"
                                >
                                    <i className="fa fa-user-plus mr-2 align-middle text-white"></i>Thêm người
                                </button>
                            </Col>
                        </Row>
                    </CardHeader>
                    
                    <CardBody>
                        
                        <Row>
                            <Col md="12">
                                <div className="mt-2">
                                    <SimpleBar style={{ maxHeight: "250px" }}>
                                    
                                        <div className="table-responsive">
                                            <Table className="table table-nowrap table-centered table-hover mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td style={{ width : "50px" }}>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck1" defaultChecked />
                                                                <Label className="custom-control-label" for="customCheck1"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1">
                                                                <a href="#" className="text-dark">Trần Văn Trọng</a>
                                                            </h5>
                                                            <p className="text-muted mb-0">Trưởng phòng Kế toán</p>
                                                        </td>
                                                        <td style={{ width : "90px" }}>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck2" />
                                                                <Label className="custom-control-label" for="customCheck2"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1"><a href="#" className="text-dark">Văn Anh</a></h5>
                                                            <p className="text-muted mb-0">Trưởng phòng MKT</p>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck3" />
                                                                <Label className="custom-control-label" for="customCheck3"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1"><a href="#" className="text-dark">Đặng Nguyên Gia</a></h5>
                                                            <p className="text-muted mb-0">Phó phòng Kinh doanh</p>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck4" />
                                                                <Label className="custom-control-label" for="customCheck4"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1"><a href="#" className="text-dark">Giang Hoàng</a></h5>
                                                            <p className="text-muted mb-0">Trưởng phòng</p>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck5" />
                                                                <Label className="custom-control-label" for="customCheck5"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1"><a href="#" className="text-dark">Nguyễn Thành An</a></h5>
                                                            <p className="text-muted mb-0">Phó phòng IT</p>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck6" />
                                                                <Label className="custom-control-label" for="customCheck6"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1"><a href="#" className="text-dark">Lan Anh Nguyễn</a></h5>
                                                            <p className="text-muted mb-0">Trưởng phòng HC</p>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <Input type="checkbox" className="custom-control-input" id="customCheck7" />
                                                                <Label className="custom-control-label" for="customCheck7"></Label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h5 className="text-truncate font-size-14 mb-1"><a href="#" className="text-dark">Bùi Loan</a></h5>
                                                            <p className="text-muted mb-0">Trưởng phòng NS</p>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <ul className="list-inline mb-0 font-size-16">
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-success p-1"><i className="fa fa-pencil" ></i></a>
                                                                    </li>
                                                                    <li className="list-inline-item">
                                                                        <a href="#" className="text-danger p-1"><i className="fa fa-trash" ></i></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </div>
                                    </SimpleBar>
                                    <div className="button-items text-center">
                                        <button className="waves-effect btn btn-primary btn-sm waves-light mt-3">
                                            <i className="fa fa-user-plus mr-2 align-middle text-white"></i>Thêm
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Modal
                            size="lg"
                            isOpen={this.state.modal_wfOption}
                            toggle={this.tog_Option}
                            >
                            <div className="modal-header">
                                <h5
                                    className="modal-title mt-0 text-primary"
                                    id="myLargeModalLabel"
                                    >
                                    Thêm người 
                                </h5>
                                <button
                                    onClick={() =>
                                        this.setState({ modal_wfOption: false })
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
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group row">
                                            <label htmlFor="example-text-input" className="col-md-3 col-form-label">Chọn người dùng</label>
                                            <div className="col-md-9">
                                                <input className="form-control" type="text" placeholder="Tìm kiếm người dùng" id="addUser" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-3 col-lg-12">
                                        <button type="button" className="btn btn-primary btn-md waves-effect waves-light"
                                            onClick={() =>
                                                this.setState({ modal_wfOption: false })
                                            }
                                            data-dismiss="modal"
                                            aria-label="Close"
                                            > Đóng
                                        </button>
                                    </div>
                                </div>
                                
                            </div>
                        </Modal>
                    
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default WfOption;