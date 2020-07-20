import React, { Component } from "react";

// MetisMenu
import MetisMenu from "metismenujs";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

//i18n
//import { withNamespaces } from 'react-i18next';

class SidebarContent extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.initMenu();
    }

    componentDidUpdate(prevProps) {
        if (this.props.type !== prevProps.type) {
            this.initMenu();
        }
    }

    initMenu() {
        new MetisMenu("#side-menu");

        var matchingMenuItem = null;
        var ul = document.getElementById("side-menu");
        var items = ul.getElementsByTagName("a");
        for (var i = 0; i < items.length; ++i) {
            if (window.location.pathname === items[i].pathname) {
                matchingMenuItem = items[i];
                break;
            }
        }
        if (matchingMenuItem) {
            this.activateParentDropdown(matchingMenuItem);
        }
    }
    

    activateParentDropdown(item) {
        item.classList.add("active");
        const parent = item.parentElement;

        if (parent) {
            parent.classList.add("mm-active");
            const parent2 = parent.parentElement;

            if (parent2) {
                parent2.classList.add("mm-show");

                const parent3 = parent2.parentElement;

                if (parent3) {
                    parent3.classList.add("mm-active"); // li
                    parent3.childNodes[0].classList.add("mm-active"); //a
                    const parent4 = parent3.parentElement;
                    if (parent4) {
                        parent4.classList.add("mm-active");
                    }
                }
            }
            return false;
        }
        return false;
    };

    render() {
        return (
            <React.Fragment>
                 <div id="sidebar-menu">
                    <ul className="metismenu list-unstyled" id="side-menu">
                        <li className="menu-title">Menu chính</li>
                        
                        <li>
                            <a href="/#" className="waves-effect active">
                                <i className="fa fa-home"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li className="menu-title">Qui trình</li>
                        <li>
                            <a href="/#" className="waves-effect has-arrow">
                                <i className="fa fa-tasks font-size-14"></i>
                                <span>Tạo qui trình</span>
                            </a>
                            <ul className="sub-menu" aria-expanded="false">
                                <li>
                                    <a href="/dashboard">
                                        <i className="fa fa-angle-right font-size-12"></i>
                                        Đánh giá thử việc
                                    </a>
                                </li>
                                <li>
                                    
                                    <a href="/dashboard-saas">
                                        <i className="fa fa-angle-right font-size-12"></i>
                                        Yêu cầu làm thêm giờ
                                    </a>
                                </li>
                                <li><a href="/dashboard-crypto"><i className="fa fa-angle-right font-size-12"></i>Xin nghỉ phép</a></li>
                                <li><a href="/dashboard-crypto"><i className="fa fa-angle-right font-size-12"></i>Qui trình nhân viên mới</a></li>
                                <li><a href="/dashboard-crypto"><i className="fa fa-angle-right font-size-12"></i>Xin nghỉ phép</a></li>
                                <li><a href="/dashboard-crypto"><i className="fa fa-angle-right font-size-12"></i>Xin nghỉ phép</a></li>
                            </ul>
                        </li>
                        <li className="menu-title">Tickets đã tạo</li>
                        <li>
                            <a href="/#">
                                <i className="fa fa-file-text font-size-14"></i>
                                <span>Tất cả các phiếu</span>
                            </a>
                        </li>
                        <li>
                            <a href="/#">
                                <i className="fa fa-file-text font-size-14"></i>
                                <span>Phiếu cần xử lý</span>
                            </a>
                        </li>
                        <li>
                            <a href="/#">
                            <i className="fa fa-file-text font-size-14"></i>
                                <span>Phiếu đã xử lý</span>
                            </a>
                        </li>
                        <li className="menu-title">Thống kê</li>
                        <li>
                            <a href="/#">
                                <i className="fa fa-pie-chart font-size-14"></i>
                                <span>Báo cáo</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </React.Fragment>
        );
    }
}

export default SidebarContent;
