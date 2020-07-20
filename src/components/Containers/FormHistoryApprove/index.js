import React, { Component } from 'react';

import { FormattedMessage } from 'react-intl';
//import messages from './messages';
import Card from 'components/Card';
import { Grid, TextField, OutlinedInput, FormControl, Select, Button } from '@material-ui/core';
import SimpleTable from 'components/Containers/Tables/MaterialTable/simpleTable';


//Styles
import './tableStyle.scss';
import '../../Containers/FormAddNew/formStyle.scss';



const tables = [
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ sinh', userRequest: 'Nguyễn Văn A', dateRequire: '20/03/2020', status: 'active' },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ mát', userRequest: 'Nguyễn Văn B', dateRequire: '20/03/2020', status: 'inactive'  },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ không lương', userRequest: 'Nguyễn Văn C', dateRequire: '20/03/2020', status: 'pending'  },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ không lương', userRequest: 'Nguyễn Văn D', dateRequire: '20/03/2020', status: 'active'  },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ không lương', userRequest: 'Nguyễn Văn E', dateRequire: '20/03/2020', status: 'pending'  },
]

const tablehead = ['#', 'Tiêu đề', 'Loại yêu cầu', 'Người yêu cầu', 'Ngày yêu cầu', 'Trạng thái']


class FormHistory extends Component {
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
                    <Grid item sm={8} xs={12}>
                        <h3>Lịch sử phê duyệt</h3>
                    </Grid>
                    <Grid item sm={2} xs={12}>
                        <Button className='btn bg-warning btn-icon'>
                            <span className="icon"><i className="fa fa-search" /></span>
                            Tìm kiếm
                        </Button>
                    </Grid>
                    <Grid item sm={2} xs={12}>
                        <Button className='btn bg-success btn-icon'>
                            <span className="icon"><i className="fa fa-refresh" /></span>
                            Làm mới
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item sm={12} xs={12}>
                        <label htmlFor="tieude">Tiêu đề</label>
                        <TextField
                            name="tieude"
                            variant="outlined"
                            className="textField"
                            fullWidth
                            //value={this.state.tieude}
                            onChange={this.changeHandler}
                        />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="typeRequest">Loại yêu cầu</label>
                        <FormControl fullWidth className="textField" variant="outlined">
                            <Select
                                native
                                name="typeRequest"
                                variant="outlined"
                                //value={this.state.zip_code}
                                onChange={this.changeHandler}
                                input={
                                    <OutlinedInput name="age" id="outlined-age-native-simple" />
                                }
                            >
                                <option value={10}>Type 01</option>
                                <option value={20}>Type 02</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="rStatus">Trạng thái<span className="text-danger">*</span></label>
                        <FormControl fullWidth className="textField" variant="outlined">
                            <Select
                                native
                                name="rStatus"
                                variant="outlined"
                                //value={this.state.zip_code}
                                onChange={this.changeHandler}
                                input={
                                    <OutlinedInput name="age" id="outlined-age-native-simple" />
                                }
                            >
                                <option value={10}>Đang xử lý</option>
                                <option value={20}>Hoàn thành</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <label htmlFor="timestart">Từ ngày</label>
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
                        <label htmlFor="timeend">Đến ngày</label>
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

                    <Grid item sm={12} xs={12}>
                        <label htmlFor="userRequest">Người yêu cầu</label>
                        <TextField
                            name="userRequest"
                            variant="outlined"
                            className="textField"
                            fullWidth
                            //value={this.state.zip_code}
                            onChange={this.changeHandler}
                        />
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <SimpleTable
                            tablehead={tablehead}
                            tablebody={tables}
                        />
                    </Grid>
                </Grid>
            </Card>
        )
    }
}

export default FormHistory;
