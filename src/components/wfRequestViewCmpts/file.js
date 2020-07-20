import React, { Component, Fragment } from 'react';
import { config } from './../../pages/environment.js';
import { objField } from './../wfShareCmpts/wfShareModel';
import {
  isNotNull, CheckNull, CheckNullSetZero, getQueryParams, formatDate, formatStatusText,
  CalculateDate, CalculateNumber, CompareNumber, CompareDate, CompareText, formatTypeCompare,
  formatStatusLabel, formatStatusTextLine, getFileBuffer, ReplaceFieldMail, ISODateString, returnObject, returnArray, FindTitleById
} from './../wfShareCmpts/wfShareFunction.js';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-groups";
import * as moment from 'moment';
import imgUserDefault from './../default-user-image.png';

import Card from 'components/Card';
import {
  Grid, TextField, OutlinedInput, FormControl, Select, Button, MenuItem,
  Checkbox, FormGroup, FormControlLabel, Radio, RadioGroup
} from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import './../Containers/FormAddNew/formStyle.scss';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, TableContainer, TablePagination, Paper } from '@material-ui/core';
import FileAttach from 'components/Containers/FileAttachments';


const SubFormApprove = ({
  itemLink, detailInternalName,
  changeFormInput, changeFormDateTime, 
  changeSearchPeople, selectSearch, removePeople,
  changeFormCheckBox,
  itemApproval, itemReject, itemReAssign, itemBackStep, itemSave
}) => {
  // console.log(detailInternalName);
  // console.log(itemLink);

  const changeSubForm = (event) => {
    console.log(event);
  }

  return (
  <Grid container alignItems="flex-end">
    <Card className="noneCard">
      <Grid container alignItems="flex-end">
        <Grid item sm={8} xs={12} md={6} xl={8}>
          <h3>Chi tiết</h3>
        </Grid>
      </Grid>
      <Grid container spacing={1} className='tableResponsive'>

        <Table className="tableWrapper mb-16">
          
          <TableHead>
            <TableRow>
              {!isNotNull(itemLink.FieldView) ? ("") : (
                itemLink.FieldView.map( field =>(
                    <TableCell key={field.InternalName}>{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</TableCell>
                  )
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
            {!isNotNull(itemLink.FieldView) ? ("") : (
            itemLink.FieldView.map(
              field => {switch (field.FieldType) {
                    case objField.Text:
                      return (<TableCell key={field.InternalName}>
                                <p>{itemLink.detailRequest[field.InternalName]}</p>
                              </TableCell>)

                    case objField.TextArea:
                      return (<TableCell  key={field.InternalName}>
                                {isNotNull(itemLink.detailRequest[field.InternalName]) ? (<textarea variant="outlined" className="textArea" value={itemLink.detailRequest[field.InternalName]}  readOnly />) : ('')}
                              </TableCell>)

                    case objField.Number:
                      return (<TableCell key={field.InternalName}>
                                <p>{itemLink.detailRequest[field.InternalName]}</p>
                              </TableCell>)

                    case objField.DateTime:
                      return (<TableCell key={field.InternalName}>
                                <p>{formatDate(itemLink.detailRequest[field.InternalName])}</p>
                              </TableCell>)

                    case objField.User:
                      return (<TableCell key={field.InternalName}>
                                <p>{itemLink.detailRequest[field.InternalName].UserTitle}</p>
                              </TableCell>)
                    
                    case objField.UserMulti:
                      return (<TableCell key={field.InternalName}>
                                <p>
                                  {itemLink.detailRequest[field.InternalName].length > 0 ? (
                                    itemLink.detailRequest[field.InternalName].map(itemUser => (
                                      itemUser.UserTitle + ", "
                                    ))
                                  ) : ("")}
                                </p>
                              </TableCell>)
                    
                    case objField.YesNo:
                      return (<TableCell key={field.InternalName}>
                                <p>{itemLink.detailRequest[field.InternalName] ? "Có" : "Không"}</p>
                              </TableCell>)

                    
                    case objField.Dropdown:
                      return (<TableCell key={field.InternalName}>
                                <p>{itemLink.detailRequest[field.InternalName]}</p>
                              </TableCell>)

                    case objField.RadioButton:
                      return (<TableCell key={field.InternalName}>
                                <p>
                                  {itemLink.detailRequest[field.InternalName].length > 0 ? (
                                    itemLink.detailRequest[field.InternalName].map(itemCheck => (
                                      itemCheck.isChecked ? (itemCheck.Value + ", ") : ("")
                                    ))
                                  ) : ("")}
                                </p>
                              </TableCell>)

                    case objField.CheckBox:
                      return (<TableCell key={field.InternalName}>
                              <p>
                                  {itemLink.detailRequest[field.InternalName].length > 0 ? (
                                    itemLink.detailRequest[field.InternalName].map(itemCheck => (
                                      itemCheck.isChecked ? (itemCheck.Value + ", ") : ("")
                                    ))
                                  ) : ("")}
                                </p>
                              </TableCell>)
                    case objField.SPLinkWF:
                      return (<TableCell key={field.InternalName}>
                                {/* <p>
                                  {itemLink.detailRequest[field.InternalName].map(itemSP =>(
                                    itemSP.Title + ', '
                                  ))}
                                </p> */}
                                <div className="showTag">
                                  {itemLink.detailRequest[field.InternalName].length > 0 ? (
                                    <div className="tagName">
                                      {itemLink.detailRequest[field.InternalName].map((spLink, keySPLink) => (
                                        <p key={keySPLink} className="wrapName">{spLink.Title} </p>
                                      ))}
                                    </div>
                                  ) : ('')}
                                </div>
                              </TableCell>)
                    
                    case objField.Hyperlink:
                      return (<TableCell key={field.InternalName}>
                                {isNotNull(itemLink.detailRequest[field.InternalName]) ? (
                                  <a target="_blank" href={itemLink.detailRequest[field.InternalName]} >{itemLink.detailRequest[field.InternalName]}</a>
                                ) : ('')}
                              </TableCell>)

                    case objField.PictureLink:
                      return (<TableCell key={field.InternalName}>
                                {isNotNull(itemLink.detailRequest[field.InternalName]) ? (
                                  // <a target="_blank" href={itemLink.detailRequest[field.InternalName]} >{itemLink.detailRequest[field.InternalName]}</a>
                                  <a target="_blank" href={itemLink.detailRequest[field.InternalName]} ><img style={{width: "100px", height: "100px"}} src={itemLink.detailRequest[field.InternalName]} /></a>
                                ) : ('')}
                              </TableCell>)

                    default:
                      return (<TableCell key={field.InternalName}>
                                <p>{itemLink.detailRequest[field.InternalName]}</p>
                              </TableCell>)
                  }
                }
              )
            )}
            </TableRow>
          </TableBody>
        </Table>

        {!isNotNull(itemLink.detailRequest) ? ("") : (
          <Grid item sm={6} xs={12}>
            <label className="form-label">Trạng thái</label>
            <p>
              <span className={formatStatusLabel(itemLink.detailRequest.StatusRequest)}>{formatStatusText(itemLink.detailRequest.StatusRequest)}</span>
            </p>
          </Grid>
        )}
        
        {isNotNull(itemLink.detailRequest) && isNotNull(itemLink.wfStepTable) ?(
          <Grid item sm={6} xs={12}>
            <label className="form-label">Bước hiện tại</label>
            <p>
              <span className="labelAlert label_warning">
                {FindTitleById(itemLink.wfStepTable, 'indexStep', itemLink.indexStep, "Title")}
              </span>
            </p>
          </Grid>
        ) : ("")}
        
      </Grid>
    </Card>
    {!isNotNull(itemLink.detailHistoryRequest) ? ("") : (
    <Card className="noneCard">
      <Grid container alignItems="flex-end">
        <Grid item sm={8} xs={12} md={6} xl={8}>
          <h3>Phê duyệt</h3>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {itemLink.FieldInput.map(
          field => {
            switch (field.FieldType) {
              case objField.Text:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <TextField variant="outlined" className="textField" fullWidth name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]} />
                </Grid>)

              case objField.TextArea:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <textarea variant="outlined" className="textArea" rows="3" name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]} />
                </Grid>)

              case objField.Number:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <TextField variant="outlined" className="textField" type="number" fullWidth name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]} />
                </Grid>)

              case objField.DateTime:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <KeyboardDatePicker fullWidth name={field.InternalName} value={itemLink.detailInput[field.InternalName]}
                      inputVariant="outlined" onChange={(date) => changeFormDateTime(field.InternalName, date, detailInternalName)}
                      format="DD-MM-YYYY" InputAdornmentProps={{ position: "end" }} className="datePicker" />
                  </MuiPickersUtilsProvider>
                </Grid>)

              case objField.Dropdown:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <FormControl fullWidth className="selectForm" variant="outlined">
                    <Select name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]}>
                      <MenuItem value="">--Select--</MenuItem>
                      {field.ObjSPField.ObjField.ChoiceField.map(op => (
                        <MenuItem value={op} key={op}>{op}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>)

              case objField.User:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <TextField variant="outlined" className="textField" fullWidth placeholder="Tìm kiếm người dùng" name={field.InternalName} onChange={(event) => changeSearchPeople(objField.User, event, detailInternalName)} value={itemLink.detailInput[field.InternalName].UserTitle} />
                  {itemLink.detailInput[`listSearch_` + field.InternalName].length > 0 ? (
                    <div id="myInputautocomplete" className="suggesAuto">
                      {itemLink.detailInput[`listSearch_` + field.InternalName].map(
                        people => (
                          <p key={people.Key} className="suggtAutoItem" onClick={() => selectSearch(people.Key, 'User', field.InternalName, detailInternalName)}><i className="fa fa-user"></i> {people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</p>
                        )
                      )}
                    </div>
                  ) : ('')}
                </Grid>)

              case objField.UserMulti:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <TextField variant="outlined" className="textField" fullWidth placeholder="Tìm kiếm người dùng" name={field.InternalName} onChange={(event) => changeSearchPeople(objField.UserMulti, event, detailInternalName)} value={itemLink.detailInput[`search_` + field.InternalName]} />
                  {itemLink.detailInput[`listSearch_` + field.InternalName].length > 0 ? (
                    <div id="myInputautocomplete" className="suggesAuto">
                      {itemLink.detailInput[`listSearch_` + field.InternalName].map(
                        people => (
                          <p key={people.Key} className="suggtAutoItem" onClick={() => selectSearch(people.Key, 'UserMulti', field.InternalName, detailInternalName)}><i className="fa fa-user"></i> {people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</p>
                        )
                      )}
                    </div>
                  ) : ('')}

                  {itemLink.detailInput[`list_` + field.InternalName].length > 0 ? (
                    <div className="tagName">
                      {itemLink.detailInput[`list_` + field.InternalName].map(users => (
                        <p key={users.UserId} className="wrapName">
                          <a onClick={() => removePeople(users.UserId, field.InternalName, detailInternalName)}><i className="fa fa-close text-danger"></i></a> {users.UserTitle}
                        </p>
                      ))}
                    </div>
                  ) : ('')}
                </Grid>)

              case objField.YesNo:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <FormGroup row>
                    <FormControlLabel
                      control={<GreenCheckBox name={field.InternalName} onChange={event => changeFormCheckBox('YesNo', event, detailInternalName)} checked={itemLink.detailInput[field.InternalName]} />} />

                  </FormGroup>
                </Grid>)

              case objField.RadioButton:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  {itemLink.detailInput[field.InternalName].length > 0 ? (
                    <RadioGroup row>
                      {itemLink.detailInput[field.InternalName].map((check, keyIn) => (
                        <FormControlLabel key={keyIn}
                          control={<GreenRadio name={field.InternalName + `|` + keyIn} onClick={event => changeFormCheckBox('RadioButton', event, detailInternalName)} value={check.Value} checked={check.isChecked} />} label={check.Value} />
                      ))}
                    </RadioGroup>
                  ) : ("")}
                </Grid>)

              case objField.CheckBox:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  {itemLink.detailInput[field.InternalName].length > 0 ? (
                    <FormGroup row>
                      {itemLink.detailInput[field.InternalName].map((check, keyIn) => (
                        <FormControlLabel key={keyIn}
                          control={<GreenCheckBox name={field.InternalName + `|` + keyIn} onChange={event => changeFormCheckBox('CheckBox', event, detailInternalName)} value={check.Value} checked={check.isChecked} />} label={check.Value} />

                      ))}
                    </FormGroup>
                  ) : ("")}
                </Grid>)

              case objField.SPLinkWF:
                return (
                  <Grid item sm={6} xs={12} key={field.InternalName}>
                    <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                    <div>
                      {itemLink.detailInput[field.InternalName].length > 0 ? (
                        <div className="tagName">
                          {itemLink.detailInput[field.InternalName].map((spLink, keySPLink) => (
                            <p key={keySPLink} className="wrapName">{spLink.Title} </p>
                          ))}
                        </div>
                      ) : ('')}
                    </div>
                  </Grid>
                )

              case objField.Label:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <p variant="outlined" name={field.InternalName}>{itemLink.detailInput[field.InternalName]}</p>
                </Grid>)

              case objField.Hyperlink:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <textarea variant="outlined" className="textArea" rows="3" name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]} />
                </Grid>)

              case objField.PictureLink:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label className="form-label">{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <textarea variant="outlined" className="textArea" rows="3" name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]} />
                  {CheckNull(itemLink.detailInput[field.InternalName]) != '' ? <img src={itemLink.detailInput[field.InternalName]}></img> : ''}
                </Grid>)

              default:
                return (<Grid item sm={6} xs={12} key={field.InternalName}>
                  <label>{field.Title} {field.Required == 1 ? (<span className="required-field">*</span>) : ("")}</label>
                  <TextField variant="outlined" className="textField" fullWidth name={field.InternalName} onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput[field.InternalName]} />
                </Grid>)
            }
          }
        )}
        <Grid item sm={6} xs={12}>
          <label className="form-label">Lý do</label>
          <textarea variant="outlined" className="textArea" rows="3" name="ReasonStep" onChange={event => changeFormInput(event, detailInternalName)} value={itemLink.detailInput.ReasonStep} />
        </Grid>
        {!itemLink.detailInput.isUserApprovalStep && itemLink.ButtonApprove.findIndex(x => x == 'Approval') ? ('') : (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Người phê duyệt tiếp theo <span className="required-field">*</span></label>
                    {itemLink.detailInput.listSelect_UserApprovalStep.length > 1 ? (
                      <FormControl fullWidth className="selectForm" variant="outlined">
                        <Select onChange={event => changeFormInput(event, detailInternalName)} name='UserApprovalStep' value={itemLink.detailInput.UserApprovalStep.UserId}>
                          <MenuItem value="">--Select--</MenuItem>
                          {itemLink.detailInput.listSelect_UserApprovalStep.map((user, index) => (
                            <MenuItem value={user.UserId} key={index}>{user.UserTitle}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                        <div>
                          <TextField
                            name='UserApprovalStep'
                            variant="outlined"
                            className="textField"
                            fullWidth
                            onChange={(event) => changeSearchPeople(objField.User, event, detailInternalName)} value={itemLink.detailInput.UserApprovalStep.UserTitle}
                            placeholder="Tìm kiếm người dùng"
                            disabled={itemLink.detailInput.IsEditApproverStep ? false : true}
                          />
                          {itemLink.detailInput.listSearch_UserApprovalStep.length > 0 ? (
                            <div id="myInputautocomplete" className="suggesAuto">
                              {itemLink.detailInput.listSearch_UserApprovalStep.map(
                                people => (
                                  <div key={people.Key} className="suggtAutoItem" onClick={() => selectSearch(people.Key, 'User', "UserApprovalStep", detailInternalName)}><i className="fa fa-user"></i>{people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</div>
                                )
                              )}
                            </div>
                          ) : ('')}
                        </div>
                      )}
                  </Grid>
                )}

                {itemLink.ButtonApprove.findIndex(x => x == 'ReAssign') != -1 ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Giao lại cho người khác</label>
                    <TextField variant="outlined" className="textField" fullWidth placeholder="Tìm kiếm người dùng" name="UserReAssign" onChange={(event) => changeSearchPeople(objField.User, event, detailInternalName)} value={itemLink.detailInput.UserReAssign.UserTitle} />
                    {itemLink.detailInput.listSearch_UserReAssign.length > 0 ? (
                      <div id="myInputautocomplete" className="suggesAuto">
                        {itemLink.detailInput.listSearch_UserReAssign.map(
                          people => (
                            <p key={people.Key} className="suggtAutoItem" onClick={() => selectSearch(people.Key, 'User', "UserReAssign", detailInternalName)}><i className="fa fa-user"></i> {people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</p>
                          )
                        )}
                      </div>
                    ) : ('')}
                  </Grid>
                ) : ''}
                {itemLink.ButtonApprove.findIndex(x => x == 'BackStep') != -1 ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Chuyển bước</label>

                    <FormControl fullWidth className="selectForm" variant="outlined">
                      <Select onChange={event => changeFormInput(event, detailInternalName)} name='BackStep' value={itemLink.detailInput.BackStep}>
                        <MenuItem value="0">--Select--</MenuItem>
                        {itemLink.detailInput.wfBackStep.length > 0 ? itemLink.detailInput.wfBackStep.map(op =>
                          <MenuItem value={op.indexStep} key={op.ID}>{op.Title}</MenuItem>
                        ) : ''}
                        {isNotNull(itemLink.detailInput.wfArrayBackStep) ? (
                          itemLink.detailInput.wfArrayBackStep.findIndex(x => x == 0) != -1 ? (
                            <MenuItem value="0">Hoàn thành</MenuItem>
                          ) : ('')
                        ) : ("")}
                      </Select>
                    </FormControl>

                  </Grid>
                ) : ''}
                {itemLink.ButtonApprove.findIndex(x => x == 'BackStep') != -1 && itemLink.detailInput.BackStep != 0 ? (
                  <Grid item sm={6} xs={12}>
                    <label className="form-label">Người xử lý tại bước chuyển </label>
                    {itemLink.detailInput.listSelect_UserApproveBackStep.length > 1 ? (
                      <FormControl fullWidth className="selectForm" variant="outlined">
                        <Select onChange={event => changeFormInput(event, detailInternalName)} name='UserApproveBackStep' value={itemLink.detailInput.UserApproveBackStep.UserId}>
                          <MenuItem value="">--Select--</MenuItem>
                          {itemLink.detailInput.listSelect_UserApproveBackStep.map((user, index) => (
                            <MenuItem value={user.UserId} key={index}>{user.UserTitle}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                        <div>
                          <TextField
                            name='UserApproveBackStep'
                            variant="outlined"
                            className="textField"
                            fullWidth
                            onChange={(event) => changeSearchPeople(objField.User, event, detailInternalName)} value={itemLink.detailInput.UserApproveBackStep.UserTitle}
                            placeholder="Tìm kiếm người dùng"
                            disabled={itemLink.detailInput.IsEditApproverBackStep ? false : true}
                          />
                          {itemLink.detailInput.listSearch_UserApproveBackStep.length > 0 ? (
                            <div id="myInputautocomplete" className="suggesAuto">
                              {itemLink.detailInput.listSearch_UserApproveBackStep.map(
                                people => (
                                  <div key={people.Key} className="suggtAutoItem" onClick={() => selectSearch(people.Key, 'User', "UserApproveBackStep", detailInternalName)}><i className="fa fa-user"></i>{people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</div>
                                )
                              )}
                            </div>
                          ) : ('')}
                        </div>
                      )}
                  </Grid>
                ) : ''}
        
                <Grid item sm={12} xs={12}>
                  {itemLink.ButtonApprove.length > 0 ? (
                    itemLink.ButtonApprove.map(
                      btnApp => {
                        if (btnApp == "Approval") {
                          return <Button className='btn bg-success' style={{ margin: "5px" }} key={btnApp} onClick={() => itemApproval(detailInternalName)}>
                            <span className="icon">
                              <i className="fa fa-send"></i>
                            </span>
                            Phê duyệt
                          </Button>
                        }
                        else if (btnApp == "Reject") {
                          return <Button className='btn bg-danger' style={{ margin: "5px" }} key={btnApp} onClick={() => itemReject(detailInternalName)}>
                            <span className="icon">
                              <i className="fa fa-lock"></i>
                            </span>
                            Từ chối
                          </Button>
                        }
                        else if (btnApp == "ReAssign") {
                          return <Button className='btn bg-warning' style={{ margin: "5px" }} key={btnApp} onClick={() => itemReAssign(detailInternalName)}>
                            <span className="icon">
                              <i className="fa fa-arrow-circle-left"></i>
                            </span>
                            Chuyển xử lý
                          </Button>
                        }
                        else if (btnApp == "BackStep") {
                          return <Button className='btn badge-default' style={{ margin: "5px" }} key={btnApp} onClick={() => itemBackStep(detailInternalName)}>
                            <span className="icon">
                              <i className="fa fa-arrow-circle-right"></i>
                            </span>
                            Chuyển bước
                          </Button>
                        }
                        else if (btnApp == "Save") {
                          return <Button className='btn bg-primary' style={{ margin: "5px" }} key={btnApp} onClick={() => itemSave(detailInternalName)}>
                            <span className="icon">
                              <i className="fa fa-save"></i>
                            </span>
                            Lưu
                          </Button>
                        }
                      }
                    )
                  ) : ('')}
                </Grid>
      </Grid>
    </Card>
    )}


  </Grid>
)

  
}

export default SubFormApprove;