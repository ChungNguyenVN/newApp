import React, { Component } from 'react';

import { FormattedMessage } from 'react-intl';
//import messages from './messages';
import Card from 'components/Card';
import { Grid, TextField, OutlinedInput, FormControl, Select, Button } from '@material-ui/core';
import SimpleTable from 'components/Containers/Tables/MaterialTable/simpleTable';


//Styles
//import './tableStyle.scss';
import '../../Containers/FormAddNew/formStyle.scss';



const tables = [
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ sinh', userApprove: 'Nguyễn Hoàng Giang', dateRequire: '20/03/2020', status: 'active', actions: 'Ongoing' },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ mát', userRequest: 'Nguyễn Văn B', dateRequire: '20/03/2020', status: 'inactive', actions: 'Ongoing'  },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ không lương', userRequest: 'Nguyễn Văn C', dateRequire: '20/03/2020', status: 'pending', actions: 'Ongoing'  },
    { titleHistory: 'Nghỉ phép', typeRequire: 'Nghỉ không lương', userRequest: 'Nguyễn Văn D', dateRequire: '20/03/2020', status: 'active', actions: 'Ongoing'  },
    { titleRequire: 'Nghỉ phép', typeRequire: 'Nghỉ không lương', userRequest: 'Nguyễn Văn E', dateRequire: '20/03/2020', status: 'pending', actions: 'Ongoing'  },
]

const tablehead = ['#', 'Tiêu đề', 'Loại yêu cầu', 'Người phê duyệt', 'Ngày yêu cầu', 'Trạng thái', 'Tác vụ']


class MyRequire extends Component {
    render() {
        return (
            <Card
                
                className="formInput"
            >   
                <Grid container spacing={3} >
                    <Grid container item sm={12} xs={12}>
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

export default MyRequire;
