import React, { Component } from 'react';
import {  TabContent, TabPane, NavLink, NavItem, CardText, Nav, Row, Col, Card, CardBody, CardHeader,CardSubtitle, CardTitle, Input, Collapse } from "reactstrap";
import classnames from "classnames";
class TabsContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTabJustify: "5",
            colTab: true
        };
        this.toggleCustomJustified = this.toggleCustomJustified.bind(this);
        this.showTab = this.showTab.bind(this);
    }

    showTab() {
        this.setState(
            {
                colTab: !this.state.colTab
            }
        );
    }

    toggleCustomJustified(tab) {
		if (this.state.activeTabJustify !== tab) {
			this.setState({
				activeTabJustify: tab
			});
		}
    }
    
    render(){
        return (
            <React.Fragment>
                <Card outline color="info" className="border">
                    <CardBody>
                        <CardTitle onClick={ this.showTab }>Qui trình con 01 <span className={ "float-right " + (!this.state.colTab ? 'fa fa-chevron-up' : 'fa fa-chevron-down')}></span></CardTitle>
                        <CardSubtitle className="mb-3">
                            Thông tin chi tiết cho quy trình đính kèm  <code className="highlighter-rouge">TSG</code> được liệt kê chi tiết
                            {/* <span className="arrow-toggle" data-toggle="collapse" data-target="#collapseH" id="collapseP">
                                <span className="fa fa-chevron-down"></span>
                                <span className="fa fa-chevron-up"></span>
                            </span> */}
                        </CardSubtitle>
                        <Collapse isOpen = { this.state.colTab }>
                            <Nav tabs className="nav-tabs-custom nav-justified">
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({
                                            active: this.state.activeTabJustify === "5"
                                        })}
                                        onClick={() => {
                                            this.toggleCustomJustified("5");
                                        }}
                                    >
                                        <span className="d-none d-sm-block">Đề xuất thanh toán 01</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({
                                            active: this.state.activeTabJustify === "6"
                                        })}
                                        onClick={() => {
                                            this.toggleCustomJustified("6");
                                        }}
                                    >
                                        <span className="d-none d-sm-block">Xuất kho lần 01</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({
                                            active: this.state.activeTabJustify === "7"
                                        })}
                                        onClick={() => {
                                            this.toggleCustomJustified("7");
                                        }}
                                    >
                                        <span className="d-none d-sm-block">Thanh toán lần 02</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({
                                            active: this.state.activeTabJustify === "8"
                                        })}
                                        onClick={() => {
                                            this.toggleCustomJustified("8");
                                        }}
                                    >
                                        <span className="d-none d-sm-block">Kiểm thử đánh giá</span>
                                    </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={this.state.activeTabJustify}>
                                <TabPane tabId="5" className="p-3">
                                    <Row>
                                        <div className="col-lg-6">
                                            <div className="form-group row">
                                                <label htmlFor="example-text-input" className="col-md-5 col-form-label"> Bộ phận yêu cầu<span className="text-danger">*</span>:</label>
                                                <div className="col-md-7">
                                                    <p className="form-control">IT</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group row">
                                                <label htmlFor="example-text-input" className="col-md-5 col-form-label">Mã liên kết</label>
                                                <div className="col-md-7">
                                                    <p className="form-control">IT001</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="form-group row">
                                                <label htmlFor="example-text-input" className="col-md-5 col-form-label"> Số tài khoản<span className="text-danger">*</span>:</label>
                                                <div className="col-md-7">
                                                    <p className="form-control">00100110011244</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group row">
                                                <label htmlFor="example-text-input" className="col-md-5 col-form-label">Giá trị thanh toán lũy kế</label>
                                                <div className="col-md-7">
                                                    <p className="form-control">0021</p>
                                                </div>
                                            </div>
                                        </div>

                                    </Row>
                                </TabPane>
                                <TabPane tabId="6" className="p-3">
                                    <Row>
                                        <Col sm="12">
                                            <CardText>
                                                Food truck fixie locavore, accusamus mcsweeney's
                                                marfa nulla single-origin coffee squid. Exercitation
                                                +1 labore velit, blog sartorial PBR leggings next
                                                level wes anderson artisan four loko farm-to-table
                                                craft beer twee. Qui photo booth letterpress,
                                                commodo enim craft beer mlkshk aliquip jean shorts
                                                ullamco ad vinyl cillum PBR. Homo nostrud organic,
                                                assumenda labore aesthetic magna delectus mollit.
                                                Keytar helvetica VHS salvia yr, vero magna velit
                                                sapiente labore stumptown. Vegan fanny pack odio
                                                cillum wes anderson 8-bit.
                                            </CardText>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="7" className="p-3">
                                    <Row>
                                        <Col sm="12">
                                            <CardText>
                                                Etsy mixtape wayfarers, ethical wes anderson tofu
                                                before they sold out mcsweeney's organic lomo retro
                                                fanny pack lo-fi farm-to-table readymade. Messenger
                                                bag gentrify pitchfork tattooed craft beer, iphone
                                                skateboard locavore carles etsy salvia banksy hoodie
                                                helvetica. DIY synth PBR banksy irony. Leggings
                                                gentrify squid 8-bit cred pitchfork. Williamsburg
                                                banh mi whatever gluten-free, carles pitchfork
                                                biodiesel fixie etsy retro mlkshk vice blog.
                                                Scenester cred you probably haven't heard of them,
                                                vinyl craft beer blog stumptown. Pitchfork
                                                sustainable tofu synth chambray yr.
                                            </CardText>
                                        </Col>
                                    </Row>
                                </TabPane>

                                <TabPane tabId="8" className="p-3">
                                    <Row>
                                        <Col sm="12">
                                            <CardText>
                                                Trust fund seitan letterpress, keytar raw denim
                                                keffiyeh etsy art party before they sold out master
                                                cleanse gluten-free squid scenester freegan cosby
                                                sweater. Fanny pack portland seitan DIY, art party
                                                locavore wolf cliche high life echo park Austin.
                                                Cred vinyl keffiyeh DIY salvia PBR, banh mi before
                                                they sold out farm-to-table VHS viral locavore cosby
                                                sweater. Lomo wolf viral, mustache readymade
                                                thundercats keffiyeh craft beer marfa ethical. Wolf
                                                salvia freegan, sartorial keffiyeh echo park vegan.
                                            </CardText>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </Collapse>
                        
                    
                    </CardBody>
                </Card>
            </React.Fragment>
        );
    }
}
export default TabsContent;