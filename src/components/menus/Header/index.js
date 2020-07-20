import React, { useState, Component } from "react";
// import { connect } from 'react-redux';
// import { injectIntl } from 'react-intl';
import { createStructuredSelector } from "reselect";
// import { compose } from 'redux';
import { Link } from "react-router-dom";
import { Grid, Menu, Button, Hidden } from "@material-ui/core";
import PerfectScrollbar from "react-perfect-scrollbar";

import "./headerStyle.scss";

// images
import avatar from "../../common/assets/images/avatar.png";
import mail from "../../common/assets/images/icons/mail.svg";
import notification from "../../common/assets/images/icons/notification.svg";
import fullScreen from "../../common/assets/images/icons/full-screen.svg";
//import makeSelectHeader from './selectors';

//Tuyên thêm
import { config } from "./../../../pages/environment.js";
// import {isNotNull, CheckNull, CheckNullSetZero, getQueryParams} from './../wfShareCmpts/wfShareFunction.js';
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
} from "./../../wfShareCmpts/wfShareFunction.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
//Tuyên thêm

const notfications = [
  {
    title: "Tuyên nghỉ phép - Lấy chồng",
    text: "Xin nghỉ 5 ngày phép đúng theo luật lao động",
  },
  {
    title: "will be distracted",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "established fact that",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "reader will be",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "voluptas sit aspernatur aut",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "will be distracted",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "established fact that",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "reader will be",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "voluptas sit aspernatur aut",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "will be distracted",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "established fact that",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
  {
    title: "reader will be",
    text: "Sed ut perspiciatis unde omnis iste natus error sit",
  },
];

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: 0,
      iconAvatar: config.productImges.iconAvatar,
      showNotification: false,
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.currentUser = undefined;
  }

  componentDidMount() {
    this.setStateForm();
  }
  clickNotification() {
    this.setState({
      showNotification: !this.state.showNotification,
    });
  }
  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    // console.log(this.currentUser);

    if (isNotNull(this.currentUser)) {
      let urlAvartar = config.productImges.iconAvatar;
      if (window["base-url"] != undefined) {
        let urlDomain = window["base-url"];
        if (window["base-url"].indexOf("-") !== -1) {
          urlDomain = window["base-url"].replace(
            window["base-url"].substring(
              window["base-url"].indexOf("-"),
              window["base-url"].indexOf(".sharepoint")
            ),
            ""
          );
        }
        urlAvartar =
          urlDomain +
          "/_layouts/15/userphoto.aspx?size=M&username=" +
          this.currentUser.Email;
      }

      const wfExecution = await this.GetRequestExecution();

      this.setState({ notification: wfExecution, iconAvatar: urlAvartar });
    }
  }

  async GetRequestExecution() {
    let execution = 0;
    const queryFilter =
      "UserApproval/ID eq " +
      this.currentUser.Id +
      " and (StatusRequest eq 1 or StatusRequest eq 3) and StatusStep eq 0";
    await sp.web.lists
      .getByTitle("WFHistory")
      .items.select("ID,Title")
      .filter(queryFilter)
      .top(100)
      .get()
      .then((listWFStep) => {
        execution = listWFStep.length;
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return execution;
  }

  gotoExecution() {
    window.location.href = config.pages.wfExecution;
  }

  render() {
    return (
      <header className="headerArea">
        <Grid container spacing={3} alignItems="center">
          <Grid item md={12} xs={12} container>
            <Grid item md={12} sm={12} xs={12}>
              <ul className="headerRight">
                {/* <li onClick={ () => this.clickNotification() } className="notificationWrap"> */}
                <li
                  onClick={() => this.gotoExecution()}
                  className="notificationWrap"
                >
                  <span className="wrapper">
                    <img src={config.productImges.iconNotification} alt="" />
                    <span className="value">
                      {this.state.notification > 99
                        ? "99+"
                        : this.state.notification}
                    </span>
                    {/* <span className="push" /> */}
                  </span>
                </li>
                <div className="profileWrap">
                  <span className="profileImg">
                    <img src={this.state.iconAvatar} alt="" />
                  </span>
                  <span className="name">
                    <span className="text">
                      {isNotNull(this.currentUser)
                        ? this.currentUser.Title
                        : "Demo User"}
                    </span>
                    {/* <i className="fa fa-angle-down" /> */}
                  </span>
                </div>
              </ul>
              {this.state.showNotification ? (
                <div className="notificationWrapper">
                  <div className="notificationPaper">
                    <div className="notificationHeader">
                      <h5>
                        Thông báo
                        <span onClick={() => this.clickNotification(false)}>
                          <i className="fa fa-close"></i>
                        </span>
                      </h5>
                    </div>

                    <div className="notificationList scrollbarArea">
                      <PerfectScrollbar>
                        <ul className="notificationItems">
                          {notfications.map((item, i) => (
                            <li key={i}>
                              <a href="">
                                <i className="icon">
                                  <svg
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fal"
                                    data-icon="bell"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                    className="svg-inline--fa fa-bell fa-w-14 fa-fw"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M224 480c-17.66 0-32-14.38-32-32.03h-32c0 35.31 28.72 64.03 64 64.03s64-28.72 64-64.03h-32c0 17.65-14.34 32.03-32 32.03zm209.38-145.19c-27.96-26.62-49.34-54.48-49.34-148.91 0-79.59-63.39-144.5-144.04-152.35V16c0-8.84-7.16-16-16-16s-16 7.16-16 16v17.56C127.35 41.41 63.96 106.31 63.96 185.9c0 94.42-21.39 122.29-49.35 148.91-13.97 13.3-18.38 33.41-11.25 51.23C10.64 404.24 28.16 416 48 416h352c19.84 0 37.36-11.77 44.64-29.97 7.13-17.82 2.71-37.92-11.26-51.22zM400 384H48c-14.23 0-21.34-16.47-11.32-26.01 34.86-33.19 59.28-70.34 59.28-172.08C95.96 118.53 153.23 64 224 64c70.76 0 128.04 54.52 128.04 121.9 0 101.35 24.21 138.7 59.28 172.08C421.38 367.57 414.17 384 400 384z"
                                    />
                                  </svg>
                                </i>
                                {item.title}
                                <span>{item.text}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </PerfectScrollbar>
                      <div className="notificationFooter">
                        <a className="seeAll" href="/">
                          Xem tất cả thông báo
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </Grid>
          </Grid>
        </Grid>
      </header>
    );
  }
}
