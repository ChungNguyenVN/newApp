import React, { Component } from "react";
import { Row, Col, Collapse } from "reactstrap";
import {
    BrowserRouter as Router,
    Route
  } from 'react-router-dom';
import classname from "classnames";

//i18n
import { withNamespaces } from 'react-i18next';

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    // componentDidMount() {
    //     var matchingMenuItem = null;
    //     var ul = document.getElementById("navigation");
    //     var items = ul.getElementsByTagName("a");
    //     for (var i = 0; i < items.length; ++i) {
    //         if (this.props.history.location.pathname === items[i].pathname) {
    //             matchingMenuItem = items[i];
    //             break;
    //         }
    //     }
    //     if (matchingMenuItem) {
    //         this.activateParentDropdown(matchingMenuItem);
    //     }
    // }

    activateParentDropdown(item) {
        item.classList.add("active");
        const parent = item.parentElement;
        if (parent) {
            parent.classList.add("active"); // li
            const parent2 = parent.parentElement;
            parent2.classList.add("active"); // li
            const parent3 = parent2.parentElement;
            if (parent3) {
                parent3.classList.add("active"); // li
                const parent4 = parent3.parentElement;
                if (parent4) {
                    parent4.classList.add("active"); // li
                    const parent5 = parent4.parentElement;
                    if (parent5) {
                        parent5.classList.add("active"); // li
                        const parent6 = parent5.parentElement;
                        if (parent6) {
                            parent6.classList.add("active"); // li
                        }
                    }
                }
            }
        }
        return false;
    };

    render() {
        return (
            <React.Fragment>
                <div className="topnav">
                    <div className="container-fluid">
                        <nav className="navbar navbar-light navbar-expand-lg topnav-menu" id="navigation">
                            <Collapse isOpen={this.props.menuOpen} className="navbar-collapse" id="topnav-menu-content">
                                <ul className="navbar-nav">
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle arrow-none" 
                                            onClick={e => { e.preventDefault(); this.setState({ isHumanR: !this.state.isHumanR }); }} href="#"
                                        >
                                            <i className="fa fa-address-book-o font-size-14"></i>Nhân sự {this.props.menuOpen}
                                            <div className="arrow-down"></div>
                                        </a>
                                        <div className={classname("dropdown-menu", { show: this.state.isHumanR })}>
                                            <a href="index" className="dropdown-item">Kế hoạch tuyển dụng</a>
                                            <a href="" className="dropdown-item">Quy trình tuyển dụng</a>
                                            <a href="#" className="dropdown-item">Quy trình nhân viên mới</a>
                                            <a href="#" className="dropdown-item">Đánh giá thử việc</a>
                                            <a href="#" className="dropdown-item">Xin nghỉ phép</a>
                                            <a href="#" className="dropdown-item">Yêu cầu làm thêm giờ</a>
                                            <a href="#" className="dropdown-item">Yêu cầu làm việc ngoài</a>
                                            <a href="#" className="dropdown-item">Yêu cầu cải tiến ý tưởng</a>
                                            <a href="#" className="dropdown-item">Xin nghỉ việc</a>
                                        </div>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle arrow-none" 
                                            onClick={e => { e.preventDefault(); this.setState({ isAdmin: !this.state.isAdmin }); }} href="#"
                                        >
                                            <i className="fa fa-briefcase font-size-14"></i> Hành chính {this.props.menuOpen}
                                            <div className="arrow-down"></div>
                                        </a>
                                        <div className={classname("dropdown-menu", { show: this.state.isAdmin })}>
                                            <a href="" className="dropdown-item">Yêu cầu đặt phòng</a>
                                            <a href="" className="dropdown-item">Yêu cầu đặt xe</a>
                                            <a href="#" className="dropdown-item">Yêu cầu mua hàng</a>
                                            <a href="#" className="dropdown-item">Quy trình mua hàng</a>
                                            <a href="#" className="dropdown-item">Yêu cầu báo hỏng, bảo hành</a>
                                            <a href="#" className="dropdown-item">Quy trình thanh lý tài sản</a>
                                        </div>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle arrow-none" 
                                            onClick={e => { e.preventDefault(); this.setState({ isAccountment: !this.state.isAccountment }); }} href="#"
                                        >
                                            <i className="fa fa-cubes font-size-14"></i> Tài chính kế toán {this.props.menuOpen}
                                            <div className="arrow-down"></div>
                                        </a>
                                        <div className={classname("dropdown-menu", { show: this.state.isAccountment })}>
                                            <a href="" className="dropdown-item">Lập kế hoạch ngân sách</a>
                                            <a href="" className="dropdown-item">Yêu cầu thanh toán</a>
                                        </div>
                                    </li>
                                </ul>
                            </Collapse>
                        </nav>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Navbar;
