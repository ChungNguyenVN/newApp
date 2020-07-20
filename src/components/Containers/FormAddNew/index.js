import React, { Component } from 'react';

import { FormattedMessage } from 'react-intl';
//import messages from './messages';
import Card from 'components/Card';
import { Grid, TextField, OutlinedInput, FormControl, Select, Button } from '@material-ui/core';
import './formStyle.scss';

class FormCreateNew extends Component {
    // constructor(props){
    //     super(props);
    //     this.state = {
    //         first_name: 'Jone',
    //         last_name: 'Doe',
    //         email: 'Jone@gmail.com',
    //         phone: '+1575454598',
    //         address: 'USA',
    //         zip_code: '1564454',
    //         status: 'Admin',
    //         date_of_birth: '30/12/1997'
    //     } 
    // };
    
    // changeHandler = (e) => {
    //     this.setState({
    //         [e.target.name]: e.target.value
    //     })
    // }
    render() {
        return (
            <Card
                
                className="formInput"
            >   
                <Grid container alignItems="flex-end">
                    <Grid item sm={9} xs={12}>
                        <h3>Yêu cầu nghỉ phép</h3>
                    </Grid>
                    <Grid item sm={3} xs={12}>
                        <Button className='btn bg-warning btn-icon'>
                            <span className="icon"><i className="fa fa-user" /></span>
                            Nghỉ phép của tôi
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item sm={12} xs={12}>
                        <label htmlFor="tieude">Tiêu đề <span className="text-danger">*</span></label>
                        <TextField
                            name="tieude"
                            variant="outlined"
                            className="textField"
                            fullWidth
                            //value={this.state.tieude}
                            onChange={this.changeHandler}
                        />
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <label htmlFor="mucdich">Mục đích <span className="text-danger">*</span></label>
                        <textarea
                            name="mucdich"
                            variant="outlined"
                            className="textArea"
                            rows="4"
                            cols="12"
                            //value={this.state.mucdic}
                            onChange={this.changeHandler}
                        />
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <label htmlFor="nguoipheduyet">Người phê duyệt <span className="text-danger">*</span></label>
                        <FormControl fullWidth className="textField" variant="outlined">
                            <Select
                                native
                                name="nguoipheduyet"
                                variant="outlined"
                                //value={this.state.zip_code}
                                onChange={this.changeHandler}
                                input={
                                    <OutlinedInput name="age" id="outlined-age-native-simple" />
                                }
                            >
                                <option value={10}>user</option>
                                <option value={20}>Admin</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <label htmlFor="loainghiphep">Loại nghỉ phép <span className="text-danger">*</span></label>
                        <FormControl fullWidth className="textField" variant="outlined">
                            <Select
                                native
                                name="loainghiphep"
                                variant="outlined"
                                //value={this.state.zip_code}
                                onChange={this.changeHandler}
                                input={
                                    <OutlinedInput name="age" id="outlined-age-native-pro" />
                                }
                            >
                                <option value={10}>1 ngày</option>
                                <option value={20}>nửa ngày</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="thoigiannghi">Thời gian nghỉ</label>
                        <FormControl fullWidth className="textField" variant="outlined">
                            <Select
                                native
                                name="thoigiannghi"
                                variant="outlined"
                                //value={this.state.zip_code}
                                onChange={this.changeHandler}
                                input={
                                    <OutlinedInput name="age" id="outlined-age-native-pro" />
                                }
                            >
                                <option value={10}>1 ngày</option>
                                <option value={20}>3 ngày</option>
                            </Select>
                        </FormControl>
                        
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="emailfor">Thông báo cho</label>
                        <TextField
                            name="emailfor"
                            variant="outlined"
                            className="textField"
                            fullWidth
                            //value={this.state.address}
                            onChange={this.changeHandler}
                        />
                        
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="timestart">Thời gian bắt đầu</label>
                        <i className="fa fa-calendar" />
                        <TextField
                            name="timestart"
                            variant="outlined"
                            className="textField"
                            fullWidth
                            //value={this.state.address}
                            onChange={this.changeHandler}
                        />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="timeend">Thời gian kết thúc</label>
                        <i className="fa fa-calendar" />
                        <TextField
                            name="timeend"
                            variant="outlined"
                            className="textField"
                            fullWidth
                            //value={this.state.zip_code}
                            onChange={this.changeHandler}
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <Button className='btn bg-primary btn-icon'>
                            <span className="icon"><i className="ti-arrow-circle-down" /></span>
                            Thêm tập tin
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Button className='btn bg-success btn-icon'>
                            <span className="icon"><i className="fa fa-send-o" /></span>
                            Gửi yêu cầu
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Button className='btn bg-secondary btn-icon'>
                            <span className="icon"><i className="fa fa-refresh" /></span>
                            Nhập lại
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        )
    }
}

export default FormCreateNew;
