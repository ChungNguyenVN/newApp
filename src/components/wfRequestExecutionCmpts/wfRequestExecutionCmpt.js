import React, { Component } from 'react';
import style from './wfRequestExecutionCmpt.css';
import { config } from './../../pages/environment.js';

import { FormattedMessage } from 'react-intl';
import Card from 'components/Card';
import { Grid, TextField, OutlinedInput, FormControl, Select, Button, MenuItem,
  Checkbox, FormGroup, FormControlLabel, Radio, RadioGroup, CircularProgress
 } from '@material-ui/core';

 import { UncontrolledAlert } from 'reactstrap';

import { KeyboardDatePicker, MuiPickersUtilsProvider, KeyboardTimePicker } from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
// import Card from 'components/Card/Loadable'
import './../Containers/FormAddNew/formStyle.scss';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import {
  isNotNull, CheckNull, CheckNullSetZero, getQueryParams, getFileBuffer, formatDate,
  CalculateDate, CalculateNumber, CompareNumber, CompareDate, CompareText,
  formatTypeObjField, formatTypeCompare, formatTypeCalculation, ReplaceFieldMail
} from './../wfShareCmpts/wfShareFunction.js';

import ConfirmDialog from '../../components/Confirms';


const GreenRadio = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const GreenCheckBox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

function sendInfo() {
  return new Promise(function(resolve) {
    setTimeout(() => resolve([1, 2, 3]), 3000);
  });
}

export default class RequestExecution extends Component {

  constructor(props) {
    super(props)

    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL }}} );
    // this.handleChangeForm = this.handleChangeForm.bind(this);

    this.state = {
      Texts: '', TextAreas: '', Numbers: '', Selects: '', 
      RadioButtons: [
        {isChecked: false, Value: "Secondary"},
        {isChecked: false, Value: "Primary"}
      ], 
      CheckBoxs: [
        {isChecked: false, Value: "Secondary"},
        {isChecked: false, Value: "Primary"}
      ], 
      isLoading: false,
      isShowMessage: false,
      open: false,
      YesNo: false, DateStart: new Date(), DateEnd: new Date(), 
      OneUser: {UserId: '', UserTitle: '', UserEmail: ''}, listSearch_OneUser: [],
      MultiUsers: [], search_MultiUsers: '', listSearch_MultiUsers: []
    };
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.fieldSearch = { FieldName: '', FieldType: '' }; this.typingTimeout = null;
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }


  //DialogComponent
  open() {
    this.setState({
      open: true
    })
  }
  setOpen() {
    this.setState({
      open:false
    })
  }
  setConfirmOpen() {
    this.setState({
      open: true
    })
  }
  handleConfirm() {
    console.log('handleConfirm');
    this.setState({
      open: false
    })
  }
  handleCancel() {
    console.log('handleCancel');
    this.setState({
      open: false
    })
  }
  //endDialog

  handleChangeForm(typeField, nameState, event){
    if(typeField == "DateTime"){
      this.setState({ [nameState]: event["_d"] });
    }
    else if (typeField == "YesNo") {
      this.setState({ [event.target.name]: event.target.checked });
    }
    else if (typeField == "CheckBox") {
      const fieldCheck = nameState.split("|");
      let arrCheck = this.state[fieldCheck[0]];
      const indexCheck = fieldCheck[1];
      arrCheck[indexCheck].isChecked = event.target.checked;
      this.setState({ [fieldCheck[0]]: arrCheck });
    }
    else if (typeField == "RadioButton") {
      const fieldCheck = nameState.split("|");
      let arrRadio = this.state[fieldCheck[0]];
      for (let rd = 0; rd < arrRadio.length; rd++) {
        if (rd == fieldCheck[1]) {
          arrRadio[rd].isChecked = event.target.checked;
        }
        else {
          arrRadio[rd].isChecked = false;
        }
      }
      this.setState({ [fieldCheck[0]]: arrRadio });
    }
    else{
      this.setState({[event.target.name]: event.target.value});
    }
    
  }

  changeFormCheckBox(typeField, event) {
    if (typeField == "YesNo") {
      this.setState({ [event.target.name]: event.target.checked });
    }
    else if (typeField == "CheckBox") {
      const fieldCheck = event.target.name.split("|");
      let arrCheck = this.state[fieldCheck[0]];
      const indexCheck = fieldCheck[1];
      arrCheck[indexCheck].isChecked = event.target.checked;
      this.setState({ [fieldCheck[0]]: arrCheck });
    }
    else if (typeField == "RadioButton") {
      const fieldCheck = event.target.name.split("|");
      let arrRadio = this.state[fieldCheck[0]];
      for (let rd = 0; rd < arrRadio.length; rd++) {
        if (rd == fieldCheck[1]) {
          arrRadio[rd].isChecked = event.target.checked;
        }
        else {
          arrRadio[rd].isChecked = false;
        }
      }
      this.setState({ [fieldCheck[0]]: arrRadio });
    }
  }

  render() {
    return (
      <Grid container className="mainCotentInner">
        <Card className="formInput" >   
          <Grid container alignItems="flex-end">
            <Grid item sm={9} xs={12}>
              <h3>Yêu cầu nghỉ phép</h3>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
              <label htmlFor="tieude">Text <span className="text-danger">*</span></label>
              <TextField name="Texts" value={this.state.Texts} variant="outlined" className="textField" fullWidth onChange={this.handleChangeForm.bind(this,'Text', 'Texts')} />
            </Grid>

            <Grid item sm={6} xs={12}>
              <label htmlFor="tieude">Number <span className="text-danger">*</span></label>
              <TextField name="Numbers" value={this.state.Numbers} variant="outlined" className="textField" fullWidth onChange={this.handleChangeForm.bind(this,'Number', 'Numbers')} type="number" />
            </Grid>

            <Grid item sm={12} xs={12}>
              <label htmlFor="mucdich">Text Area <span className="text-danger">*</span></label>
              <textarea name="TextAreas" value={this.state.TextAreas} variant="outlined" className="textArea" rows="4" cols="12" onChange={this.handleChangeForm.bind(this,'TextArea', 'TextAreas')} />
            </Grid>
            
            <Grid item sm={6} xs={12}>
              <label htmlFor="nguoipheduyet">Select<span className="text-danger">*</span></label>
              <FormControl fullWidth className="selectForm" variant="outlined">
                <Select name="Selects" value={this.state.Selects} onChange={this.handleChangeForm.bind(this,'Dropdown', 'Selects')}>
                  <MenuItem value="Ten">Ten</MenuItem>
                  <MenuItem value="Twenty">Twenty</MenuItem>
                  <MenuItem value="Thirty">Thirty</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label htmlFor="loainghiphep">Yes/No<span className="text-danger">*</span></label>
              <FormGroup>
                <FormControlLabel control={ <GreenCheckBox name="YesNo" value={this.state.YesNo} onChange={this.handleChangeForm.bind(this, 'YesNo', 'YesNo')} /> } label="Yes" />
              </FormGroup>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label htmlFor="loainghiphep">Check Box<span className="text-danger">*</span></label>
              <FormGroup>
                {this.state.CheckBoxs.map((checkbox, keyIn)=>(
                  <FormControlLabel key={keyIn} control={ <GreenCheckBox name={`CheckBoxs|`+ keyIn} onChange={this.handleChangeForm.bind(this, 'CheckBox', `CheckBoxs|`+ keyIn)} checked={checkbox.isChecked} /> } label={checkbox.Value} />
                ))}
                {/* <FormControlLabel control={ <GreenCheckBox name="mucdich" value={this.state.CheckBoxs}/> } label="Secondary" />
                <FormControlLabel control={ <GreenCheckBox name="mucdich" value={this.state.CheckBoxs} /> } label="Primary" /> */}
              </FormGroup>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label htmlFor="loainghiphep">Radio Button<span className="text-danger">*</span></label>
              <RadioGroup >
                {this.state.RadioButtons.map((radio, keyIn)=>(
                  <FormControlLabel key={keyIn} control={ <GreenRadio name={`RadioButtons|`+ keyIn} onChange={this.handleChangeForm.bind(this, 'RadioButton', `RadioButtons|`+ keyIn)} checked={radio.isChecked} /> } label={radio.Value} />
                ))}
                {/* <FormControlLabel control={ <GreenRadio name="mucdich" value={this.state.RadioButtons} /> } label="Secondary" />
                <FormControlLabel control={ <GreenRadio name="mucdich" value={this.state.RadioButtons} /> } label="Primary" /> */}
              </RadioGroup >
            </Grid>

            <Grid item sm={6} xs={12}>
              <label htmlFor="timeend">Date Start</label>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker fullWidth name="DateStart" value={this.state.DateStart} placeholder="10/10/2018"
                  inputVariant="outlined" onChange={(date) => this.handleChangeForm("DateTime", "DateStart", date)} minDate={new Date()}
                  format="DD-MM-YYYY" InputAdornmentProps={{ position: "end" }} className="datePicker" />
              </MuiPickersUtilsProvider>
            </Grid>
            
            <Grid item sm={6} xs={12}>
              <label htmlFor="timeend">Date End</label>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker fullWidth name="DateEnd" value={this.state.DateEnd} placeholder="10/10/2018"
                  inputVariant="outlined" onChange={(date) => this.handleChangeForm("DateTime", "DateEnd", date)} minDate={new Date()}
                  format="DD-MM-YYYY" InputAdornmentProps={{ position: "end" }} className="datePicker" />
              </MuiPickersUtilsProvider>
            </Grid>

            <Grid item sm={6} xs={12}>
              <label htmlFor="nguoipheduyet">One User<span className="text-danger">*</span></label>
              <TextField name="OneUser" value={this.state.OneUser.UserTitle} onChange={this.changeSearchPeople.bind(this, "User")} variant="outlined" className="textField" fullWidth />
              {this.state.listSearch_OneUser.length > 0 ? (
                <div id="myInputautocomplete" className="suggtAuto">
                  {this.state.listSearch_OneUser.map(
                    people => (
                      <p key={people.Key} onClick={() => this.selectSearch(people.Key, 'User', "OneUser")}><i className="fa fa-user"></i> {people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</p>
                    )
                  )}
                </div>
              ) : ('')}
            </Grid>
            <Grid item sm={6} xs={12}>
              <label htmlFor="nguoipheduyet">Multilple Users<span className="text-danger">*</span></label>
              <TextField name="MultiUsers" value={this.state.search_MultiUsers} onChange={this.changeSearchPeople.bind(this, "UserMulti")} variant="outlined" className="textField" fullWidth />
                {this.state.listSearch_MultiUsers.length > 0 ? (
                  <div id="myInputautocomplete" className="suggtAuto">
                    {this.state.listSearch_MultiUsers.map(
                      people => (
                        <p key={people.Key} onClick={() => this.selectSearch(people.Key, 'UserMulti', "MultiUsers")}><i className="fa fa-user"></i> {people.DisplayText}
                        {` (${people.Description}`}
                        {isNotNull(people.EntityData.Title)
                          ? ` - ${people.EntityData.Title})`
                          : `)`}</p>
                      )
                    )}
                  </div>
                ) : ('')}

                {this.state.MultiUsers.length > 0 ? (
                  <div className="tagName">
                    {this.state.MultiUsers.map(users => (
                      <p key={users.UserId} className="wrapName">
                        <a onClick={() => this.removePeople(users.UserId, "MultiUsers")}><i className="fa fa-close text-danger"></i></a> {users.UserTitle}
                      </p>
                    ))}
                  </div>
                ) : ('')}
            </Grid>

            <Grid item xs={12} sm={12} className="text-center">
              <div className="btnList">
                <Button className='btn bg-primary btn-icon'>
                  <i className="fa fa-spinner"></i>Thêm tập tin
                </Button>
                <Button className='btn bg-success' onClick={() => this.saveForm()}>
                  <i className="fa-send-o fa"></i> Gửi yêu cầu
                </Button>
                <Button className='btn bg-secondary' onClick={() => this.setConfirmOpen()}><i className="fa-refresh fa"></i> Nhập lại</Button>
                <ConfirmDialog 
                  titleDialog="Reset form?"
                  descriptionDialog="Bạn muốn làm mới toàn bộ form, và toàn bộ thông tin sẽ mất ?"
                  confirmText="Đồng ý"
                  cancelText= "Hủy"
                  open={this.state.open}
                  setOpen={this.onClose}
                  handleCancel = {this.handleCancel}
                  handleConfirm = {this.handleConfirm}
                >
                  
                </ConfirmDialog>
              </div>
            </Grid>
          </Grid>
         </Card>
         {/* isLoading and alertMessage */}
         {this.state.isLoading ? (
          <div className="preLoader">
            <div className="loadingContent"><CircularProgress className="mr-10 text-primary" /></div>
          </div>  
          ) : ("")
        }

        {this.state.isShowMessage ? (
          <div className="showMessage">
            <UncontrolledAlert color="success" className="bg-success">Gửi thông tin thành công</UncontrolledAlert>
            <UncontrolledAlert color="danger" className="bg-danger">Gửi thông tin không thành công</UncontrolledAlert>
            <UncontrolledAlert color="danwarningger" className="bg-warning">Điền thông tin đầy đủ</UncontrolledAlert>
          </div>
          ) : ("")
        }
      </Grid>
    );
  }

  changeSearchPeople(typeUser, event) {
    this.fieldSearch = { FieldName: event.target.name, FieldType: typeUser };
    if (typeUser == "User") {
      let fieldUser = this.state[event.target.name];
      fieldUser.UserId = ''; fieldUser.UserEmail = '';
      fieldUser.UserTitle = event.target.value;
      this.setState({ [event.target.name]: fieldUser });
    }
    else {
      this.setState({ [`search_` + event.target.name]: event.target.value });
    }
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  async callSearchPeople() {
    let searchValue = '';
    if (this.fieldSearch.FieldType == "User") {
      searchValue = this.state[this.fieldSearch.FieldName].UserTitle
    }
    else {
      searchValue = this.state[`search_` + this.fieldSearch.FieldName]
    }
    let PeoplePicker = await this.searchPeoplePicker(searchValue);
    this.setState({ [`listSearch_` + this.fieldSearch.FieldName]: PeoplePicker });
    this.fieldSearch = { FieldName: '', FieldType: '' };
  }

  async searchPeoplePicker(value) {
    let arrPeople = []
    await sp.profiles.clientPeoplePickerSearchUser({
      MaximumEntitySuggestions: 5,
      PrincipalSource: 15,
      PrincipalType: 15,
      QueryString: value
    }).then(
      (entiries) => {
        arrPeople = entiries
      }
    ).catch(
      error => {
        console.log(error);
      }
    )
    return arrPeople;
  }

  async selectSearch(Key, typeUser, InternalName) {

    let user = await sp.web.ensureUser(Key);
    let objUser = { UserId: CheckNullSetZero(user["data"].Id), UserTitle: CheckNull(user["data"].Title), UserEmail: CheckNull(user["data"].Email) };
    if (objUser.UserId !== 0) {
      if (typeUser == "User") {
        this.setState({ [InternalName]: objUser, [`listSearch_` + InternalName]: [] });
      }
      else {
        const arrPeople = this.state[InternalName];
        if (arrPeople.findIndex(x => x.UserId == user["data"].Id) == -1) {
          arrPeople.push(objUser);
        }
        this.setState({  [InternalName]: arrPeople, [`search_` + InternalName]: "", [`listSearch_` + InternalName]: [] });
      }
    }
    else {
      if (typeUser == "User") {
        this.setState({ [InternalName]: { UserId: '', UserTitle: '', UserEmail: '' }, [`listSearch_` + InternalName]: [] });
      }
      else {
        this.setState({ [`search_` + InternalName]: "", [`listSearch_` + InternalName]: [] });
      }
    }
  }

  removePeople(IdUser, InternalName) {
    let arrPeople = this.state[InternalName];
    let index = arrPeople.findIndex(x => x.UserId == IdUser);
    arrPeople.splice(index, 1);
    this.setState({ [InternalName]: arrPeople });
  }

  saveForm(){
    console.log(this.state);
    this.setState({ isLoading: true });
    this.setState({isShowMessage: true});
    sendInfo().then(list => {
      this.setState({
        isLoading: false,
        isShowMessage: false
      });
    });
  }


}