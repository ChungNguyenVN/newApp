import React, { Component } from "react";

import { Row, Col, Card, CardHeader, CardBody, CardTitle, Container, Modal, Button } from "reactstrap";
import {Table, Thead, Tbody, Tr, Th, Td} from 'react-super-responsive-table';
import TabsContent from '../Tabs';

class WfAttach extends Component { 
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
                        <h5 className="my-2">Quy trình đính kèm</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="row mb-3">
                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-2 col-form-label">Từ ngày</label>
                                    <div className="col-md-10">
                                        <input className="form-control" type="datetime-local" defaultValue="2019-08-19T13:45:00" id="example-datetime-local-input" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-md-2 col-form-label">Đến ngày</label>
                                    <div className="col-md-10">
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
                                <TabsContent></TabsContent>
                            </div>
                            
                        </div>
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default WfAttach;