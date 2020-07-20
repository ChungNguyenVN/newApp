import React, { useState, Fragment, Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { compose } from "redux";
import { config } from "./../../pages/environment.js";
import { Grid, ExpansionPanel, ExpansionPanelSummary,Dialog,Button } from "@material-ui/core";
import { NavLink, Link } from "react-router-dom";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Collapse from "@material-ui/core/Collapse";
import IconExpandLess from "@material-ui/icons/ExpandLess";
import IconExpandMore from "@material-ui/icons/ExpandMore";
import PerfectScrollbar from "react-perfect-scrollbar";

import "./sideNav.scss";
import productPicture from "./../logo.png";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  loadChildBranch,
} from "./../wfShareCmpts/wfShareFunction.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
// images

import iDashboard from "../common/assets/images/icons/sidebar/dashboard/ana.svg";
import iCreate from "../common/assets/images/icons/sidebar/dashboard/crt.svg";
import iMy from "../common/assets/images/icons/sidebar/form.svg";
import iNeed from "../common/assets/images/icons/sidebar/dashboard/map.svg";
import iHis from "../common/assets/images/icons/sidebar/dashboard/ui.svg";
import iReport from "../common/assets/images/icons/sidebar/dashboard/ch.svg";

// import ch from 'images/icons/sidebar/dashboard/crt.svg'
// import anaH from 'images/icons/sidebar/dashboard/ana-h.svg'
// import ui from 'images/icons/sidebar/dashboard/ui.svg'
// import map from 'images/icons/sidebar/dashboard/map.svg'
// import form from 'images/icons/sidebar/form.svg'
// import formH from 'images/icons/sidebar/form-h.svg'
// import table from 'images/icons/sidebar/table.svg'
// import tableH from 'images/icons/sidebar/table-h.svg'
// import pricing from 'images/icons/sidebar/new/pricing.svg'
// import pricingH from 'images/icons/sidebar/new/pricing-h.svg'

// images
import logo from "../../components/common/assets/images/lgoSoft.png";
import shareService from "../wfShareCmpts/wfShareService.js";
import WFMenuSub from "./wfMenuSub/index.js";
export default class sidebarNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ArrWF: [],
      open: this.props.activeClass == "RequestAddNew" ? true : false,
      showMenu: true,
      wfListMenu: [],
      permiss:{},
      ModalMenu: false,
      MenuInfo:{Title:'',Code:'',LinkMenu:'',OrderNumber:0,IconName:'',ParentCode:'',ClassName:'',TargetBlank:false,IsApplication:false}
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.WFTableCode = "";
    this.wfTable = [];
    this.wfDepartment = [];
    this.wfListMenu = [];
    this.closeDialog = this.closeDialog.bind(this);
    this.resultMenu = this.resultMenu.bind(this);
  }
  //setMnu
  hideMenu() {
    this.setState({
      showMenu: !this.state.showMenu,
    });
  }

  componentDidMount() {
    let param = getQueryParams(window.location.search);
    this.WFTableCode = param["WFTableCode"];
    this.setStateForm();
  }

  async setStateForm() {
    this.currentUser = await sp.web.currentUser();
    // console.log(this.currentUser);
    this.wfTable = await shareService.GetArrayWFTable(1);
    // console.log(this.wfTable);
    this.wfDepartment = await shareService.GetListDepartment();
    // console.log(this.wfDepartment);
    this.wfListMenu = await shareService.GetListMenu();
    let arrWF = [];
    let permiss = await shareService.checkPermissionUser(
      this.currentUser.Id,
      this.wfDepartment
    );
    console.log(permiss);
    if (permiss.Permission == "Admin") {
      arrWF = this.wfTable;
    } else {
      for (let i = 0; i < permiss.Dept.length; i++) {
        let deptPer = permiss.Dept[i];

        let dept = this.wfTable.filter(
          (wf) => wf.WhoIsUsed == "Department" && wf.Department == deptPer.Code
        );
        dept.map((child) => {
          if (arrWF.findIndex((wf) => wf.WFId == child.WFId) == -1) {
            arrWF.push(child);
          }
        });

        let deptChild = loadChildBranch(deptPer);
        deptChild.map((child1) => {
          let childDept = this.wfTable.filter(
            (wf) => wf.WhoIsUsed == "Department" && wf.Department == child1.Code
          );
          if (childDept.length > 0) {
            childDept.map((child2) => {
              if (arrWF.findIndex((wf) => wf.WFId == child2.WFId) == -1) {
                arrWF.push(child2);
              }
            });
          }
        });
      }

      let DepartmentList = this.wfDepartment.filter(
        (dp) => dp.Members.indexOf(this.currentUser.Id) != -1
      );

      DepartmentList.map((child1) => {
        let childDept = this.wfTable.filter(
          (wf) => wf.WhoIsUsed == "Department" && wf.Department == child1.Code
        );
        if (childDept.length > 0) {
          childDept.map((child2) => {
            if (arrWF.findIndex((wf) => wf.WFId == child2.WFId) == -1) {
              arrWF.push(child2);
            }
          });
        }
      });

      let wfDefault = this.wfTable.filter(
        (wf) =>
          wf.WhoIsUsed == "All Users" ||
          (wf.WhoIsUsed == "Users" &&
            wf.UserDefault.indexOf(this.currentUser.Id) != -1)
      );
      wfDefault.map((child) => {
        if (arrWF.findIndex((wf) => wf.WFId == child.WFId) == -1) {
          arrWF.push(child);
        }
      });
    }

    // console.log(arrWF);
    this.setState({ ArrWF: arrWF, wfListMenu: this.wfListMenu,permiss:permiss });
  }

  handleClick(open) {
    if (isNotNull(open)) {
      let wfListMenu = this.state.wfListMenu;
      wfListMenu.find((x) => x.Code == open).Open = !this.wfListMenu.find(
        (y) => y.Code == open
      ).Open;
      this.setState({
        wfListMenu: wfListMenu,
      });
    } else {
      let checkMenu = this.state.open;
      this.setState({
        open: !checkMenu,
      });
    }
  }

  hideMenu() {
    let openMenu = !this.state.showMenu;

    this.setState({
      showMenu: openMenu,
    });
  }
  closeDialog() {
    this.setState({
      ModalMenu: false,
     
    });
  }
AddMenu(){
  this.setState({ ModalMenu: true });
}
async resultMenu(MenuInfo) {
  await shareService.AddMenu(MenuInfo)
  this.wfListMenu = await shareService.GetListMenu();
  this.setState({wfListMenu: this.wfListMenu,ModalMenu:false})
}
  render() {
    const { ArrWF, open, wfListMenu ,permiss,ModalMenu,MenuInfo} = this.state;
    return (
      <Grid>
        <div className="mnuMobile" onClick={this.hideMenu.bind(this)}>
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fal"
            data-icon="bars"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="svg-inline--fa fa-bars fa-w-14 fa-fw"
          >
            <path
              fill="currentColor"
              d="M442 114H6a6 6 0 0 1-6-6V84a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6zm0 160H6a6 6 0 0 1-6-6v-24a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6zm0 160H6a6 6 0 0 1-6-6v-24a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6z"
            ></path>
          </svg>
        </div>

        <Grid
          className={
            !this.state.showMenu
              ? "sidebarMainWrapper openMenu"
              : "sidebarMainWrapper"
          }
        >
          <div className="colupsMenuSidebar" onClick={this.hideMenu.bind(this)}>
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fal"
              data-icon="bars"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="svg-inline--fa fa-bars fa-w-14 fa-fw"
            >
              <path
                fill="currentColor"
                d="M442 114H6a6 6 0 0 1-6-6V84a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6zm0 160H6a6 6 0 0 1-6-6v-24a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6zm0 160H6a6 6 0 0 1-6-6v-24a6 6 0 0 1 6-6h436a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6z"
              ></path>
            </svg>
          </div>

          <Grid>
            <div className="sidebarWrap">
              <div className="logo">
                <a href={config.pages.wfDashboard}>
                  <img
                    className="normal"
                    src={config.productImges.iconlogo}
                    alt=""
                  />
                </a>
              </div>
              <Grid className="sidebarMenu">
                <PerfectScrollbar>
                  <List component="nav">
                    {/* <ListItem button>
                      <a
                        href={config.pages.wfDashboard}
                        className={
                          this.props.activeClass == "isDashboard"
                            ? `activeMnu`
                            : ""
                        }
                      >
                        <img src={config.productImges.iconDashboard} />
                        <ListItemText
                          primary="Trang chủ"
                          className="itemMenu"
                        />
                      </a>
                    </ListItem>

                    <ListItem button onClick={() => this.handleClick()}>
                      <img src={config.productImges.iconCreate} />
                      <ListItemText
                        primary="Tạo quy trình"
                        className={`itemMenu ${
                          this.props.activeClass == "RequestAddNew"
                            ? `activeSub`
                            : ""
                          }`}
                      />
                      {open ? <IconExpandLess /> : <IconExpandMore />}
                    </ListItem>
                    <Collapse in={open} timeout="auto">
                      <Divider />
                      <List component="div" disablePadding>
                        <p className="subMenu">
                          {ArrWF.length > 0
                            ? ArrWF.map((wf) => (
                              <a
                                className={`ListTypeRequest ${
                                  this.WFTableCode == wf.WFCode
                                    ? "active"
                                    : ""
                                  }`}
                                key={wf.WFId}
                                href={`${config.pages.wfRequestAddNew}?WFTableId=${wf.WFId}&WFTableCode=${wf.WFCode}&indexStep=${wf.WFIndexStep}`}
                              >
                                <i className="fa fa-angle-right"></i>
                                {wf.WFTitle}
                              </a>
                            ))
                            : ""}
                        </p>
                      </List>
                    </Collapse>
                    <ListItem button>
                      <img src={config.productImges.iconExecution} />
                      <a
                        href={`${config.pages.wfMyRequest}?RequestType=AllRequest`}
                        className={
                          this.props.activeClass == "isAllRequest"
                            ? `activeMnu`
                            : ""
                        }
                      >
                        <ListItemText
                          primary="Tất cả các phiếu"
                          className="itemMenu"
                        />
                      </a>
                    </ListItem>
                    <ListItem button>
                      <img src={config.productImges.iconMyRequest} />
                      <a
                        href={`${config.pages.wfMyRequest}?RequestType=MyRequest`}
                        className={
                          this.props.activeClass == "isMyRequest"
                            ? `activeMnu`
                            : ""
                        }
                      >
                        <ListItemText
                          primary="Phiếu đã tạo"
                          className="itemMenu"
                        />
                      </a>
                    </ListItem>

                    <ListItem button>
                      <img src={config.productImges.iconExecution} />
                      <a
                        href={config.pages.wfExecution}
                        className={
                          this.props.activeClass == "isExecution"
                            ? `activeMnu`
                            : ""
                        }
                      >
                        <ListItemText
                          primary="Phiếu cần xử lý"
                          className="itemMenu"
                        />
                      </a>
                    </ListItem>

                    <ListItem button>
                      <img src={config.productImges.iconHistory} />
                      <a
                        href={config.pages.wfHistoryApprove}
                        className={
                          this.props.activeClass == "isHistoryApprove"
                            ? `activeMnu`
                            : ""
                        }
                      >
                        <ListItemText
                          primary="Phiếu đã xử lý"
                          className="itemMenu"
                        />
                      </a>
                    </ListItem>

                    <ListItem button>
                      <img src={config.productImges.iconReport} />
                      <a
                        href={`${config.pages.wfMyRequest}?RequestType=ReportRequest`}
                        className={
                          this.props.activeClass == "isReportRequest"
                            ? `activeMnu`
                            : ""
                        }
                      >
                        <ListItemText primary="Báo cáo" className="itemMenu" />
                      </a>
                    </ListItem> */}
                    {wfListMenu
                      .filter((x) => !isNotNull(x.ParentCode))
                      .map((item, indexItem) =>
                        item.Code == "CreateWF" ? (
                          <div key={indexItem}>
                            <ListItem
                              button
                              onClick={() => this.handleClick()}
                              key={item.Code}
                            >
                              <img
                                src={
                                  config.productImges["" + item.IconName + ""]
                                }
                              />
                              <ListItemText
                                primary={item.Title}
                                className={`itemMenu ${
                                  this.props.activeClass == item.ClassName
                                    ? `activeSub`
                                    : ""
                                }`}
                              />
                              {open ? <IconExpandLess /> : <IconExpandMore />}
                            </ListItem>
                            <Collapse in={open} timeout="auto">
                              <Divider />
                              <List component="div" disablePadding>
                                <p className="subMenu">
                                  {ArrWF.length > 0
                                    ? ArrWF.map((wf) => (
                                        <a
                                          className={`ListTypeRequest ${
                                            this.WFTableCode == wf.WFCode
                                              ? "active"
                                              : ""
                                          }`}
                                          key={wf.WFId}
                                          href={`${config.pages.wfRequestAddNew}?WFTableId=${wf.WFId}&WFTableCode=${wf.WFCode}&indexStep=${wf.WFIndexStep}`}
                                        >
                                          <i className="fa fa-angle-right"></i>
                                          {wf.WFTitle}
                                        </a>
                                      ))
                                    : ""}
                                </p>
                              </List>
                            </Collapse>
                          </div>
                        ) : wfListMenu.findIndex(
                            (y) => y.ParentCode == item.Code
                          ) != -1 ? (
                          <div key={indexItem}>
                            <ListItem
                              button
                              onClick={() => this.handleClick(item.Code)}
                              key={item.Code}
                            >
                              <img
                                src={
                                  config.productImges["" + item.IconName + ""]
                                }
                              />
                              <ListItemText
                                primary={item.Title}
                                className={`itemMenu ${
                                  this.props.activeClass == item.ClassName
                                    ? `activeSub`
                                    : ""
                                }`}
                              />
                              {item.Open ? (
                                <IconExpandLess />
                              ) : (
                                <IconExpandMore />
                              )}
                            </ListItem>
                            {item.Open ? (
                              <Collapse in={true} timeout="auto">
                                <Divider />
                                <List component="div" disablePadding>
                                  <p className="subMenu">
                                    {wfListMenu
                                      .filter((z) => z.ParentCode == item.Code)
                                      .map((k) => (
                                        <a
                                          className="ListTypeRequest"
                                          key={k.ID}
                                          href={
                                            k.IsApplication
                                              ? config.pages.link +
                                                k.LinkMenu
                                              : k.LinkMenu
                                          }
                                          target={k.TargetBlank ? "_blank" : ""}
                                        >
                                          <i className="fa fa-angle-right"></i>
                                          {k.Title}
                                        </a>
                                      ))}
                                  </p>
                                </List>
                              </Collapse>
                            ) : (
                              ""
                            )}
                          </div>
                        ) : (
                          <ListItem button key={item.Code}>
                            <img
                              src={config.productImges["" + item.IconName + ""]}
                            />
                            <a
                              href={
                                item.IsApplication
                                  ? config.pages.link + item.LinkMenu
                                  : item.LinkMenu
                              }
                              target={item.TargetBlank ? "_blank" : ""}
                              className={
                                this.props.activeClass == item.ClassName
                                  ? `activeMnu`
                                  : ""
                              }
                            >
                              <ListItemText
                                primary={item.Title}
                                className="itemMenu"
                              />
                            </a>
                          </ListItem>
                        )
                      )}
                  </List>
                  {permiss.Permission == "Admin" ?  <Button
                              className="btn bg-success"
                              style={{ margin: "5px" }}
                              onClick={() => this.AddMenu()}
                            >
                            Thêm mới link menu
                           </Button>:''}
                </PerfectScrollbar>
              </Grid>
              {!ModalMenu ? (
            ""
          ) : (
            <Dialog open={ModalMenu} fullWidth maxWidth="xl">
              <WFMenuSub
              MenuInfo={MenuInfo}
                closeDialog={this.closeDialog}
                resultMenu={this.resultMenu}
                ListMenu = {wfListMenu}
              />
            </Dialog>
          )}
            </div>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
