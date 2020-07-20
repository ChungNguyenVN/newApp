import React, { Component } from "react";




import { Container, Row, Col, Button, Card, CardBody, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Media, Table } from "reactstrap";
//Import Breadcrumb
import ListDetail from './formDetail';
import ProgressWF from '../ProgressBarWF';
import Approve from './Approved';
import Comment from './comment';
import WfOption from "./wfOptions";
import ActivityHistory from "./history";
import WfAttach from "../VerticalLayout/wfAttach";
import LinkToWorkflow from "../ViewDetail/linkWf";
import AddNew from "../ViewDetail/formAddNew";

import Breadcrumbs from '../Breadcrumb/Breadcrumb';


class LayoutDetail extends Component {
  constructor(props) {
    super(props);
    
  }



  render() {
    return (
        <React.Fragment>
            <Breadcrumbs title="Trang chủ" breadcrumbItem="Chi tiết yêu cầu" className="mt-5" />
            <Row>
                <Col lg="12">
                    <ProgressWF></ProgressWF>
                </Col>
                <Col lg="8">
                    <ListDetail></ListDetail>
                    <AddNew></AddNew>
                    <WfAttach></WfAttach>
                    <LinkToWorkflow></LinkToWorkflow>
                    <Approve></Approve>
                </Col>
                <Col lg="4">
                    <Comment></Comment>
                    <WfOption></WfOption>
                    <ActivityHistory></ActivityHistory>
                </Col>
            </Row>
        </React.Fragment>
    );
  }
}


export default LayoutDetail;

