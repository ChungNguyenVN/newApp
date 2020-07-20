import React, { useState, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { compose } from 'redux';
import { config } from '../../../pages/environment.js';
import {
    Grid,
    ExpansionPanel,
    ExpansionPanelSummary
} from '@material-ui/core';
import { NavLink, Link } from 'react-router-dom';



import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'
import IconExpandLess from '@material-ui/icons/ExpandLess'
import IconExpandMore from '@material-ui/icons/ExpandMore'

import PerfectScrollbar from 'react-perfect-scrollbar'

import './topMenu.scss';
//import productPicture from './../logo.png';
import { isNotNull, CheckNull, CheckNullSetZero, getQueryParams } from '../../wfShareCmpts/wfShareFunction.js';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
// images

import iDashboard from '../../common/assets/images/icons/sidebar/dashboard/ana.svg'
import iCreate from '../../common/assets/images/icons/sidebar/dashboard/crt.svg'
import iMy from '../../common/assets/images/icons/sidebar/form.svg'
import iNeed from '../../common/assets/images/icons/sidebar/dashboard/map.svg'
import iHis from '../../common/assets/images/icons/sidebar/dashboard/ui.svg'
import iReport from '../../common/assets/images/icons/sidebar/dashboard/ch.svg'

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
import logo from '../../common/assets/images/lgoSoft.png';


export default class TopMenu extends Component {

    constructor(props) {
        super(props);
        this.state = { ArrWF: [], open: this.props.activeClass == "RequestAddNew" ? true : false, 
            showMenu: true, 
            isAMount: false, 
            notification: 0, 
            iconAvatar: config.productImges.iconAvatar, 
            showNotification: false 
        }
        sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
        //console.log(this.props.activeClass);
        this.WFTableCode = '';
        this.layoutMenu = '';
        this.currentUser = undefined;
        // this.handleClick = this.handleClick.bind()
        // console.log(config.productPicture)
        
    }
    //setMnu
    otherMenu(){
        if(this.layoutMenu == "topMenu"){
            this.layoutMenu == "topMenu";
            document.body.classList.add('fullLayout');
        }
        else if(this.layoutMenu == "leftMenu"){
            this.layoutMenu == "leftMenu";
            document.body.classList.remove('fullLayout');
        }
        else{
            this.layoutMenu == "leftMenu";
            document.body.classList.remove('fullLayout');
        }
    }
    hideMenu() {
        this.setState(
            {
                showMenu: !this.state.showMenu
            }
        )
    }

    changeMenu(){
        console.log(this);
        document.body.classList.remove('fullLayout');
        this.setState({
          isAMount: this.state.isAMount
        })
    }

    componentDidMount() {
        let param = getQueryParams(window.location.search);
        this.WFTableCode = param["WFTableCode"];
        this.layoutMenu = param["layoutMenu"];
        this.otherMenu();
        this.setStateForm();
    }

    async setStateForm() {
        this.currentUser = await sp.web.currentUser();
        // console.log(this.currentUser);

        this.wfTable = await this.GetWFTable();
        // console.log(this.wfTable);

        this.wfDepartment = await this.GetListDepartment();
        // console.log(this.wfDepartment);

        let arrWF = [];
        for (let i = 0; i < this.wfTable.length; i++) {
            if (this.wfTable[i].WhoIsUsed == "Users") {
                if (this.wfTable[i].UserDefault.findIndex(x => x == this.currentUser.Id) !== -1) {
                    arrWF.push({
                        wfID: this.wfTable[i].ID,
                        wfCode: this.wfTable[i].Code,
                        wfTitle: this.wfTable[i].Title
                    })
                }
            }
            else if (this.wfTable[i].WhoIsUsed == "Department") {
                let dept = this.wfDepartment.find(d => d.Code == this.wfTable[i].Department);
                if (isNotNull(dept)) {
                    if (dept.Members.findIndex(x => x == this.currentUser.Id) !== -1 || dept.Manager == this.currentUser.Id) {
                        arrWF.push({
                            wfID: this.wfTable[i].ID,
                            wfCode: this.wfTable[i].Code,
                            wfTitle: this.wfTable[i].Title
                        })
                    }
                }

            }
            else {
                arrWF.push({
                    wfID: this.wfTable[i].ID,
                    wfCode: this.wfTable[i].Code,
                    wfTitle: this.wfTable[i].Title
                })
            }
        }
        // console.log(arrWF)
        this.setState({ ArrWF: arrWF });
    }

    async GetWFTable() {
        let arrStepWF = [];
        await sp.web.lists.getByTitle("WFTable").items.select("ID,Title,Code,Created,Status,WhoIsUsed,WIUGroup,WIUId").filter('Status eq 1').orderBy("ID", true).get().then(
            listWFStep => {
                // console.log(listWFStep);
                listWFStep.forEach(itemDetail => {
                    arrStepWF.push({
                        ID: itemDetail.ID,
                        Code: CheckNull(itemDetail["Code"]),
                        Title: CheckNull(itemDetail["Title"]),
                        Description: CheckNull(itemDetail["Description"]),
                        WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
                        Department: CheckNull(itemDetail["WIUGroup"]),
                        UserDefault: itemDetail["WIUId"],
                        Status: CheckNull(itemDetail["Status"])
                    });
                });
            }
        ).catch(
            error => {
                console.log(error);
            }
        )
        // console.log(details);
        return arrStepWF;
    }

    async GetListDepartment() {
        let items = [];
        await sp.web.lists.getByTitle("ListDepartment").items.select("ID,Title,DeptCode,ManagerId,MembersId").get().then(
            itemList => {
                // console.log(itemList);
                if (itemList.length > 0) {
                    itemList.forEach(element => {
                        items.push({
                            ID: element.ID,
                            Title: element.Title,
                            Code: element.DeptCode,
                            Manager: element.ManagerId,
                            Members: element.MembersId
                        })
                    });
                }

            }
        ).catch(
            error => {
                console.log(error);
            }
        )
        // console.log(items);
        return items;
    }
    
    // const [open, setOpen] = (false)

    handleClick(open) {
        let checkMenu = this.state.open;
        this.setState(
            {
                open: !checkMenu
            }
        )
    }

    hideMenu() {
        let openMenu = !this.state.showMenu;

        this.setState(
            {
                showMenu: openMenu
            }
        )
    }


    render() {
        const { ArrWF, open } = this.state;
        console.log(this.layoutMenu);
        return (
            <Grid container>
                <Grid className="secondMenu" container item xl={12} lg={12}>
                    <div className="wrappContent">
                        <ul className="headerRight">
                            <li onClick={ () => this.clickNotification() } className="notificationWrap">
                                <span className="wrapper">
                                    <img src={config.productImges.iconNotification} alt="" />
                                    <span className="value">{this.state.notification}</span>
                                    {/* <span className="push" /> */}
                                </span>
                            </li>
                            {/* <li onClick={() => this.gotoExecution()} className="messageWrap">
                                <span className="wrapper">
                                    <img src={config.productImges.iconEmail} alt="" />
                                    <span className="value">{this.state.notification}</span>
                                </span>
                            </li>
                            <li className="fullScreenWrap">
                                <img src={config.productImges.iconFullScreen} alt="" />
                            </li> */}
                            <div className="profileWrap">
                                <span className="profileImg">
                                    <img src={this.state.iconAvatar} alt="" />
                                </span>
                                <span className="name">
                                    <span className="text">{isNotNull(this.currentUser) ? this.currentUser.Title: "Demo User" }</span>
                                    {/* <i className="fa fa-angle-down" /> */}
                                </span>
                                
                            </div>
                        </ul>
                        { this.state.showNotification? 
                            <div className="notificationWrapper">
                                
                                
                                <div className="notificationPaper">
                                    <div className="notificationHeader">
                                        <h5>
                                            Thông báo
                                            <span onClick={ () => this.clickNotification(false) }><i className="fa fa-close"></i></span>
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
                        :null }
                    </div>
                    
                </Grid>
                <Grid className="topBaHeaderArea" item xl={12} lg={12}>
                    
                    <Grid container alignItems="center">
                        <Grid container>
                            <Grid className="topBarMenuWrap">
                                <Grid item className="topmenuLogo" xl={2} lg={2} sm={6} xs={12}>
                                    <a href={config.pages.wfDashboard}>
                                        <img className="normal" src={config.productImges.iconlogo} alt="" />
                                    </a>
                                </Grid>
                                <Grid className="hMenu" item xl={10} lg={10}>
                                    <List component="nav" className="clearFix horizontalScroll">
                                        <ListItem button  className="itemHeader" >
                                            <a href={config.pages.wfDashboard} className={this.props.activeClass == "isDashboard" ? `activeMnu` : ''}>
                                                <img src={config.productImges.iconDashboard} />
                                                <ListItemText primary="Trang chủ" className="itemhMenu" />
                                            </a>
                                        </ListItem>

                                        <ListItem button onClick={() => this.handleClick()}  className="itemHeader" >
                                            <img src={config.productImges.iconCreate} />
                                            <ListItemText primary="Tạo yêu cầu" className={`itemhMenu ${this.props.activeClass == "RequestAddNew" ? `activeSub` : ''}`}/>
                                            {open ? <IconExpandLess /> : <IconExpandMore />}
                                            <Collapse in={open} timeout="auto" className="subHeader">
                                                
                                                <List component="div" disablePadding>
                                                    <p className="subMenu">
                                                        {ArrWF.length > 0 ? (
                                                            ArrWF.map(wf => (
                                                                
                                                                <a className={`ListTypeRequest ${this.WFTableCode == wf.wfCode ? "active" : ""}`} key={wf.wfID} href={`${config.pages.wfRequestAddNew}?WFTableId=${wf.wfID}&WFTableCode=${wf.wfCode}`}><i className="fa fa-angle-right"></i>{wf.wfTitle}</a>
                                                            ))
                                                        ) : ('')}
                                                    </p>

                                                </List>
                                            </Collapse>
                                        </ListItem>
                                        
                                        <ListItem button className="itemHeader">
                                            <img src={config.productImges.iconHistory} />
                                            <a href={`${config.pages.wfMyRequest}?RequestType=AllRequest`} className={this.props.activeClass == "isAllRequest" ? `activeMnu` : ''}>
                                                <ListItemText primary="Tất cả yêu cầu" className="itemhMenu" />
                                            </a>

                                        </ListItem>

                                        <ListItem button className="itemHeader" >
                                            <img src={config.productImges.iconMyRequest} />
                                            <a href={config.pages.wfMyRequest} className={this.props.activeClass == "isRequest" ? `activeMnu` : ''}>
                                                <ListItemText primary="Yêu cầu của tôi" className="itemhMenu" />
                                            </a>

                                        </ListItem>

                                        <ListItem button  className="itemHeader" >
                                            <img src={config.productImges.iconExecution} />
                                            <a href={config.pages.wfExecution} className={this.props.activeClass == "isExecution" ? `activeMnu` : ''}>
                                                <ListItemText primary="Yêu cầu cần phê duyệt" className="itemhMenu" />
                                            </a>

                                        </ListItem>
                                        <ListItem button  className="itemHeader" >
                                            <img src={config.productImges.iconHistory} />
                                            <a href={config.pages.wfHistoryApprove} className={this.props.activeClass == "isHistoryApprove" ? `activeMnu` : ''}>
                                                <ListItemText primary="Lịch sử phê duyệt" className="itemhMenu" />
                                            </a>

                                        </ListItem>

                                        <ListItem button className="itemHeader" >
                                            <img src={config.productImges.iconReport} />
                                            <a href={config.pages.wfReport} className={this.props.activeClass == "isReports" ? `activeMnu` : ''}>
                                                <ListItemText primary="Báo cáo" className="itemhMenu" />
                                            </a>
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            
            
            
            
        );
    };
}  