import React, { Component } from 'react';
import style from './Menu.css';
import productPicture from './../logo.png';
import { config} from './../../pages/environment.js';
import {isNotNull, CheckNull, CheckNullSetZero, getQueryParams} from './../wfShareCmpts/wfShareFunction.js';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";

export default class Menu extends Component {

  constructor(props){
    super(props);
    this.state = {ArrWF: []}
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL }}} );
  }

  componentDidMount(){
    this.setStateForm();
  }

  async setStateForm(){
    this.currentUser = await sp.web.currentUser();
    // console.log(this.currentUser);

    this.wfTable = await this.GetWFTable();
    // console.log(this.wfTable);

    this.wfDepartment = await this.GetListDepartment();
    // console.log(this.wfDepartment);

    let arrWF = [];
    for(let i = 0; i < this.wfTable.length; i++){
      if(this.wfTable[i].WhoIsUsed == "Users"){
        if(this.wfTable[i].UserDefault.findIndex(x => x == this.currentUser.Id) !== -1){
          arrWF.push({
            wfID: this.wfTable[i].ID,
            wfCode: this.wfTable[i].Code,
            wfTitle: this.wfTable[i].Title
          })
        }
      }
      else if(this.wfTable[i].WhoIsUsed == "Department"){
        let dept = this.wfDepartment.find(d => d.Code == this.wfTable[i].Department);
        if(isNotNull(dept)){
          if(dept.Members.findIndex(x => x == this.currentUser.Id ) !== -1 || dept.Manager == this.currentUser.Id){
            arrWF.push({
              wfID: this.wfTable[i].ID,
              wfCode: this.wfTable[i].Code,
              wfTitle: this.wfTable[i].Title
            })
          }
        }
        
      }
      else{
        arrWF.push({
          wfID: this.wfTable[i].ID,
          wfCode: this.wfTable[i].Code,
          wfTitle: this.wfTable[i].Title
        })
      }
    }
    // console.log(arrWF)
    this.setState({ArrWF: arrWF});
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
        if(itemList.length > 0){
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

  render() {
    // console.log(config);
    const {ArrWF} = this.state;
    return (
      <div className={style.Menu}>
        {/* <a href={config.pages.wfList} ><img className="logo" src={productPicture} /></a> */}
        <a href={config.pages.wfDashboard} ><img className="logo" src={config.productPicture} /></a>
        <ul>
          <li><a className="active" href={config.pages.wfDashboard}>Trang chủ</a></li>
          {/* <li><a href={config.pages.wfRequestAddNew}>Tạo yêu cầu</a></li> */}
          <li className={style.dropdown}>
            <a className={style.dropbtn}>Tạo yêu cầu</a>
            <div className={style.dropdown_content}>
              {ArrWF.length > 0 ? (
                ArrWF.map(wf =>(
                  <a key={wf.wfID} href={`${config.pages.wfRequestAddNew}?WFTableId=${wf.wfID}&WFTableCode=${wf.wfCode}`}>{wf.wfTitle}</a>
                ))
              ): ('')}
              {/* <a href={`${config.pages.wfRequestAddNew}?WFTableId=1&WFTableTitle=LeaveofAbsence`}>Leave of Absence</a>
              <a href={`${config.pages.wfRequestAddNew}?WFTableId=2&WFTableTitle=RoomBooking`}>Booking Room</a>
              <a href={`${config.pages.wfRequestAddNew}?WFTableId=3&WFTableTitle=CarBooking`}>Booking Car</a> */}
            </div>
          </li>
          <li><a href={config.pages.wfMyRequest}>Yêu cầu của tôi</a></li>
          <li><a href={config.pages.wfExecution}>Yêu cầu cần phê duyệt</a></li>
          <li><a href={config.pages.wfHistoryApprove}>Lịch sử phê duyệt</a></li>
          <li><a href={config.pages.wfReport}>Báo cáo</a></li>
          
        </ul>
      </div>
      
    );
  }
}
