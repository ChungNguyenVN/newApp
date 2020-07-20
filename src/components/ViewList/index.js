import React, { Component } from "react";

// Layout Related Components
import Header from "../../components/VerticalLayout/Header";
import Sidebar from "../../components/VerticalLayout/Sidebar";
import Footer from "../../components/VerticalLayout/Footer";

import Navbar from "../../components/VerticalLayout/HorizontalMenu/";
import Filter from "../Forms/FilterList"

import { Container, Row, Col, Button, Card, CardBody, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Media, Table } from "reactstrap";
//Import Breadcrumb
import Breadcrumbs from '../Breadcrumb/Breadcrumb';


class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
		  isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
		  
	  	reports : [
			{ icon : "fa fa-envelope-o font-size-24 pr-0", title : "Yêu cầu của tôi", value : "12", badgeValue : "2%", color : "primary", desc : "Tăng với tháng trước" },
			{ icon : "fa fa-clock-o font-size-24 pr-0", title : "Yêu cầu cần phê duyệt", value : "6", badgeValue : "-2%", color : "danger", desc : "Giảm với tháng trước" },
			{ icon : "fa fa-check-square-o font-size-24 pr-0", title : "Yêu cầu Đã hoàn thành", value : "6", badgeValue : "12%", color : "success", desc : "Tăng với tháng trước" },
			{ icon : "fa fa-history font-size-24 pr-0", title : "Yêu cầu cần phê duyệt", value : "6", badgeValue : "12%", color : "info", desc : "Lịch sử phê duyệt" },
		]
    };
    this.toggleMenuCallback = this.toggleMenuCallback.bind(this);
  }

//   capitalizeFirstLetter = string => {
//     return string.charAt(1).toUpperCase() + string.slice(2);
//   };

  componentDidMount() {

    if (this.props.isPreloader === true) {
      document.getElementById('preloader').style.display = "block";
      document.getElementById('status').style.display = "block";

      setTimeout(function () {

        document.getElementById('preloader').style.display = "none";
        document.getElementById('status').style.display = "none";

      }, 2500);
    }
    else {
      document.getElementById('preloader').style.display = "none";
      document.getElementById('status').style.display = "none";
    }

    // Scroll Top to 0
	window.scrollTo(0, 0);
	
    // let currentage = this.capitalizeFirstLetter(this.props.location.pathname);
    // document.title =
	//   currentage + " | Skote - Responsive Bootstrap 4 Admin Dashboard";
	  
    if (this.props.leftSideBarTheme) {
      this.props.changeSidebarTheme(this.props.leftSideBarTheme);
    }

    if (this.props.layoutWidth) {
      this.props.changeLayoutWidth(this.props.layoutWidth);
    }

    if (this.props.leftSideBarType) {
      this.props.changeSidebarType(this.props.leftSideBarType);
    }
    if (this.props.topbarTheme) {
      this.props.changeTopbarTheme(this.props.topbarTheme);
    }

    if (this.props.showRightSidebar) {
      this.toggleRightSidebar();
    }




    
    
  }

  // Scroll Top to 0
  
  toggleMenuCallback () {
    if (this.props.leftSideBarType === "default") {
      this.props.changeSidebarType("condensed", this.state.isMobile);
    } else if (this.props.leftSideBarType === "condensed") {
      this.props.changeSidebarType("default", this.state.isMobile);
    }
  };

  render() {
    return (
        <React.Fragment>
			<div id="preloader">
				<div id="status">
					<div className="spinner-chase">
					<div className="chase-dot"></div>
					<div className="chase-dot"></div>
					<div className="chase-dot"></div>
					<div className="chase-dot"></div>
					<div className="chase-dot"></div>
					<div className="chase-dot"></div>
					</div>
				</div>
			</div>

			<div id="layout-wrapper">
				<Header toggleMenuCallback={this.toggleMenuCallback}/>
			
				<Sidebar theme={this.props.leftSideBarTheme}
					type={this.props.leftSideBarType}
					isMobile={this.state.isMobile} 
				/>
				<div className="page-content">
					<div className="main-content">
						<Navbar/>
						<Breadcrumbs title="Trang chủ" breadcrumbItem="Theo dõi hồ sơ" className="mt-5" />
						<Row>
							<Col lg="12">
								<Filter/>
								
							</Col>
						</Row>
					</div>
				</div>
				<Footer />
			</div>
        </React.Fragment>
    );
  }
}


export default Layout;

