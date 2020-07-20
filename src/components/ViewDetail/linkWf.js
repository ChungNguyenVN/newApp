import React, { Component } from "react";

import { Row, Col, Card, CardHeader, CardBody, CardTitle, Container, Modal, Button } from "reactstrap";
import {Table, Thead, Tbody, Tr, Th, Td} from 'react-super-responsive-table';
import TabsContent from '../Tabs';

class LinkToWorkflow extends Component { 
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
                        <h5 className="my-2">Link tới quy trình</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="row mb-3">
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Người phê duyệt</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="text" defaultValue="Giang Nguyễn" placeholder=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Chuyển bước</label>
                                    <div className="col-md-8">
                                        <input className="form-control" type="text" defaultValue="Hoàn thành" placeholder=""/>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Loại quy trình</label>
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
                                    <label htmlFor="example-text-input" className="col-md-4 col-form-label">Quy trình cha</label>
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
                                <div className="button-items mt-2 mb-2 text-center">
                                    <button className="waves-effect btn btn-primary btn-md waves-light">
                                        Tìm kiếm <i className="fa fa-search ml-2 align-middle text-white font-size-16"></i> 
                                    </button>
                                </div>
                            </div>

                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-2 col-form-label">Lựa chọn</label>
                                    <div className="col-md-10">
                                        <select className="form-control">
                                            <option>Chọn</option>
                                            <option>Large select</option>
                                            <option>Small select</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* listView */}
                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-2 col-form-label">Tài liệu đính kèm</label>
                                    <div className="col-md-8">
                                        <button className="waves-effect btn btn-info btn-sm waves-light">
                                            <i className="fa fa-paperclip mr-2 align-middle text-white font-size-16"></i> Thêm tập tin
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default LinkToWorkflow;