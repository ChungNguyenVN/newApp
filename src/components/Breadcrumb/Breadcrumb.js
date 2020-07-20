import React, { Component } from 'react';
import { Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";

class Breadcrumbs extends Component {


    render() {
        return (
            <React.Fragment>
                <Row className="mt-5">
                    <Col xs="12">
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0 font-size-18">{this.props.breadcrumbItem}</h4>
                            <div className="page-title-right">
                                <Breadcrumb listClassName="m-0">
                                    <BreadcrumbItem>
                                        <a href="#">{this.props.title}</a>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem active>
                                        <a href="#">{this.props.breadcrumbItem}</a>
                                    </BreadcrumbItem>
                                </Breadcrumb>
                            </div>
                        </div>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default Breadcrumbs;