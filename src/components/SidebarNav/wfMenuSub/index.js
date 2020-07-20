import React, { Component } from "react";
import { config } from "../../../pages/environment.js";
import {
  isNotNull,
  returnObject,
  returnArray,
} from "components/wfShareCmpts/wfShareFunction.js";
import { objField } from "components/wfShareCmpts/wfShareModel";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-groups";
import * as moment from "moment";
import Card from "components/Card";
import {
  Grid,
  TextField,
  OutlinedInput,
  FormControl,
  Select,
  Button,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Dialog,
  Checkbox
} from "@material-ui/core";
import "components/Containers/FormAddNew/formStyle.scss";
import shareService from "components/wfShareCmpts/wfShareService.js";
import { withStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
const GreenCheckBox = withStyles({
  root: {
    color: green[400],
    "&$checked": {
      color: green[600],
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);
export default class wfMenuSub extends Component {
  constructor(props) {
    super(props);

    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.state = {
      MenuInfo: this.props.MenuInfo,
      ListMenu: this.props.ListMenu
      // isSynchronized: this.props.isSynchronized,
    };

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      MenuInfo: nextProps.MenuInfo,
      ListMenu: nextProps.ListMenu
      // isSynchronized: nextProps.isSynchronized,
    });
  }

  render() {
    const { MenuInfo, ListMenu } = this.state;
    return (
      <div className="mainContainer" style={{ minHeight: "auto" }}>
        <div className="mainContentRouter" style={{ width: "100%" }}>
          <Grid container>
            <Card className="formInput btnForm">
              <Grid container alignItems="flex-end" className="mb-30">
                <Grid item sm={8} xs={12} md={6} xl={8}>
                  <h3>Thêm mới link menu</h3>
                </Grid>
                {this.props.closeDialog != undefined ? (
                  <Grid item sm={12} xs={12} md={6} xl={4}>
                    <div className="btnList pull-right">
                      <Button
                        className="btn btn-text bg-secondary"
                        onClick={() => this.props.closeDialog()}
                      >
                        <i className="fa fa-times" /> Đóng
                      </Button>
                    </div>
                  </Grid>
                ) : (
                    ""
                  )}
              </Grid>
              <Grid container spacing={3} className="mb-30">
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Title(<span className="required-field">*</span>)</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    fullWidth
                    name="Title"
                    onChange={(event) =>
                      this.changeFormInput(event)
                    }
                    value={MenuInfo.Title}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Code(<span className="required-field">*</span>)</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    fullWidth
                    name="Code"
                    onChange={(event) =>
                      this.changeFormInput(event)
                    }
                    value={MenuInfo.Code}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Link menu(<span className="required-field">*</span>)</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    fullWidth
                    name="LinkMenu"
                    onChange={(event) =>
                      this.changeFormInput(event)
                    }
                    value={MenuInfo.LinkMenu}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Icon name</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    fullWidth
                    name="IconName"
                    onChange={(event) =>
                      this.changeFormInput(event)
                    }
                    value={MenuInfo.IconName}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Parent code</label>
                  <FormControl
                    fullWidth
                    className="selectForm"
                    variant="outlined"
                  >
                    <Select
                      name="ParentCode"
                      onChange={(event) => this.changeFormInput(event)}
                      value={MenuInfo.ParentCode}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {ListMenu.filter(x => x.ParentCode == '').map(
                        (op) => (
                          <MenuItem value={op.Code} key={op.Code}>
                            {op.Title}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Order number</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    type="number"
                    fullWidth
                    name="OrderNumber"
                    onChange={(event) =>
                      this.changeFormInput(event)
                    }
                    value={MenuInfo.OrderNumber}
                  />
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Target blank</label>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <GreenCheckBox
                          name="TargetBlank"
                          onChange={(event) =>
                            this.changeFormInput(event)
                          }
                          checked={MenuInfo.TargetBlank}
                        />
                      }
                    />
                  </FormGroup>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Is application</label>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <GreenCheckBox
                          name="IsApplication"
                          onChange={(event) =>
                            this.changeFormInput(event)
                          }
                          checked={MenuInfo.IsApplication}
                        />
                      }
                    />
                  </FormGroup>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <label className="form-label"> Class name</label>
                  <TextField
                    variant="outlined"
                    className="textField"
                    fullWidth
                    name="ClassName"
                    onChange={(event) =>
                      this.changeFormInput(event)
                    }
                    value={MenuInfo.ClassName}
                  />
                </Grid>
              </Grid>
              <Grid item sm={12} xs={12} className="text-center">
                <div className="btnList">
                  <Button
                    className="btn bg-primary"
                    onClick={() => this.saveSubForm()}
                  >
                    {" "}
                    <span className="icon">
                      <i className="fa fa-send"></i>
                    </span>
                    Lưu
                  </Button>
                </div>
              </Grid>
            </Card>
          </Grid>
        </div>
      </div>
    );
  }
  saveSubForm() {
    let checkShow = this.checkSaveSubMenu();
    if (isNotNull(checkShow)) {
      alert(
        "Bạn chưa nhập đầy đủ thông tin bắt buộc : \n" +
          checkShow
      );
      return;
    }
    if(this.state.ListMenu.findIndex(x=>x.Code==this.state.MenuInfo.Code)!=-1)
    {
      alert(
        "Code menu đã tồn tại" 
      );
      return;
    }
    else{
      this.props.resultMenu(
        this.state.MenuInfo,
      );
    }
    
  }
  changeFormInput(event) {
    let valueState = event.target.value;
    let nameState = event.target.name;
    let MenuInfo = returnObject(this.state.MenuInfo);
    if (nameState == "TargetBlank" || nameState == "IsApplication") {
      MenuInfo[nameState] = event.target.checked
    }
    else {
      MenuInfo[nameState] = valueState
    }
    this.setState({ MenuInfo: MenuInfo });

  }
  checkSaveSubMenu() {
    let textShow = "";
    if(!isNotNull(this.state.MenuInfo.Title)){
      textShow+=' Title,'
    }
    if(!isNotNull(this.state.MenuInfo.Code)){
      textShow+=' Code,'
    }
    if(!isNotNull(this.state.MenuInfo.LinkMenu)){
      textShow+=' Link menu,'
    }
    return textShow;
  }
}
