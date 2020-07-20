import React, { Component } from "react";

import { connect } from "react-redux";
import { Row, Col } from "reactstrap";

import { Link } from "react-router-dom";

// Reactstrap
import { Dropdown, DropdownToggle, DropdownMenu } from "reactstrap";

// // Import menuDropdown
// import LanguageDropdown from "../CommonForBoth/TopbarDropdown/LanguageDropdown";
// import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
// import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";

// import megamenuImg from "../../assets/images/megamenu-img.png";
//import logo from "../../assets/images/logo.svg";
// import logoLightPng from "../../assets/images/logo-light.png";
import logo from "../../assets/images/bpmLogo.png";
//import logo from "../../assets/images/logo.svg";
// import logoDark from "../../assets/images/logo-dark.png";

// // import images
// import github from "../../assets/images/brands/github.png";
// import bitbucket from "../../assets/images/brands/bitbucket.png";
// import dribbble from "../../assets/images/brands/dribbble.png";
// import dropbox from "../../assets/images/brands/dropbox.png";
// import mail_chimp from "../../assets/images/brands/mail_chimp.png";
// import slack from "../../assets/images/brands/slack.png";

//i18n
//import { withNamespaces } from 'react-i18next';

// Redux Store

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearch: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  /**
   * Toggle sidebar
   */
  toggleMenu() {
    this.props.toggleMenuCallback();
  }

  /**
   * Toggles the sidebar
   */


  

  render() {
    return (
      <React.Fragment>
        <header id="page-topbar">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box">

                <a href="/" className="logo p-0">
                  {/* <span className="logo-sm">
                    <img src={ logo } alt="" height="22" />
                  </span> */}
                  <span className="logo-lg">
                    <img src={logo} alt="" height="50" />
                  </span>
                </a>
              </div>

              <button type="button" onClick={this.props.toggleMenu} className="btn btn-sm px-3 text-secondary font-size-16 header-item waves-effect" id="vertical-menu-btn">
                <i className="fa fa-bars"></i>
              </button>

              <form className="app-search d-none d-lg-block">
                <div className="position-relative">
                  <input type="text" className="form-control" placeholder="Tìm kiếm..." />
                  <span className="fa fa-search"></span>
                </div>
              </form>
              {/* isMobile */}
              <div className="dropdown d-inline-block d-lg-none ml-2">
                <button onClick={() => { this.setState({ isSearch: !this.state.isSearch }); }} type="button" className="btn header-item noti-icon waves-effect" id="page-header-search-dropdown">
                  <i className="fa fa-search"></i>
                </button>
                <div className={this.state.isSearch ? "dropdown-menu dropdown-menu-lg dropdown-menu-right p-0 show" : "dropdown-menu dropdown-menu-lg dropdown-menu-right p-0"}
                  aria-labelledby="page-header-search-dropdown">

                  <form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search ..." aria-label="Recipient's username" />
                        <div className="input-group-append">
                          <button className="btn btn-primary" type="submit"><i className="fa fa-search"></i></button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* endShow */}
            </div>
          </div>
        </header>

              

      </React.Fragment>
    );
  }
}
// const mapStatetoProps = state => {
//   const { layoutType } = state.Layout;
//   return { layoutType };
// };

export default (Header);
