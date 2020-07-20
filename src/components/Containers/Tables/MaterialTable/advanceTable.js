import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';

import { config } from '../../../../pages/environment.js';
import * as moment from 'moment';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import { 
    isNotNull, CheckNull, CheckNullSetZero, ISODateString, 
    formatDate, formatStatusText, formatStatusLabel 
} from '../../../wfShareCmpts/wfShareFunction.js';

function createData(ItemIndex, Title, wfTableTitle, UserApproval, indexStepname, StatusStep, DateRequest, Action) {
    return { ItemIndex, Title, wfTableTitle, UserApproval, indexStepname, StatusStep, DateRequest, Action };
}


const rows = [
    createData(1, 'Cupcake', 'WFA', "Demo Account", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(3, 'Donut', 'WFA', "Demo Account", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(2, 'Eclair', 'WFA', "Demo Account", "Bước 1", "Chờ xử lý", "25/03/2020", "Action"),
    createData(7, 'Frozen yoghurt', 'WFA', "Manager Demo", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(8, 'Gingerbread', 'WFA', "Demo Test1", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(6, 'Honeycomb', 'WFA', "Nguyen Duc Tuyen", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(5, 'Ice cream sandwich', 'WFA', "Manager Demo", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(9, 'Jelly Bean', 'WFA', "Demo Test1", "Bước 1", "Chờ xử lý", "26/04/2020", "Action"),
    createData(4, 'KitKat', 'WFA', "Nguyen Duc Tuyen", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(11, 'Lollipop', 'WFA', "Manager Demo", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
    createData(13, 'Marshmallow', 'WFA', "Demo Test1", "Bước 1", "Chờ xử lý", "26/04/2020", "Action"),
    createData(10, 'Nougat', 'WFA', "Demo Test2", "Bước 1", "Chờ xử lý", "20/03/2020", "Action"),
    createData(12, 'Oreo', 'WFA', "Nguyen Duc Tuyen", "Bước 1", "Chờ xử lý", "26/03/2020", "Action"),
];

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const tableHead = [
    { FieldName: 'ItemIndex', FieldTitle: '#', isSort: false },
    { FieldName: 'Title', FieldTitle: 'Tiêu đề', isSort: false },
    { FieldName: 'wfTableTitle', FieldTitle: 'Loại yêu cầu', isSort: false },
    { FieldName: 'UserApproval', FieldTitle: 'Người phê duyệt', isSort: false },
    { FieldName: 'indexStepname', FieldTitle: 'Bước hiện tại', isSort: false },
    { FieldName: 'StatusStep', FieldTitle: 'Trạng thái', isSort: false },
    { FieldName: 'DateRequest', FieldTitle: 'Ngày yêu cầu', isSort: false },
    { FieldName: 'Action', FieldTitle: 'Tác vụ', isSort: false },
];

const styles = (theme) => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  });

class AdvanceTable extends React.Component {
    constructor(props) {
        super(props);
        console.log("call constructor");
        console.log(this.props);
        sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
        this.state = { 
            order: 'asc', orderBy: 'DateRequest', selected: [], page: 0, rowsPerPage: 10, historyRequest: [],
            selectWFHistory: this.props.selectWFHistory, expandWFHistory: this.props.expandWFHistory, 
            filterWFHistory: this.props.filterWFHistory, headTable: this.props.headTable,
            WFTable: this.props.WFTable, WFStepTable: this.props.WFStepTable, SPList: this.props.SPList
        }
    }

    handleRequestSort(event, property) {
        console.log("handleRequestSort");
        const isAsc = this.state.orderBy === property && this.state.order === 'asc';
        this.setState({order: isAsc ? 'desc' : 'asc', orderBy: property, page: 0 })
        // setOrder(isAsc ? 'desc' : 'asc');
        // setOrderBy(property);
        // setPage(0);
    };

    handleChangePage(event, newPage) {
        console.log("handleChangePage");
        // setPage(newPage);
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage(event) {
        console.log("handleChangeRowsPerPage");
        this.setState({rowsPerPage: parseInt(event.target.value, 10), page: 0})
        // setRowsPerPage(parseInt(event.target.value, 10));
        // setPage(0);
    };

    // componentDidMount(){
    //     console.log("componentDidMount")
    //     // this.Search();
    // }

    componentDidUpdate(){
        console.log("componentDidUpdate")
        console.log(this.props);
        // this.Search();
    }

    // componentWillUpdate(){
    //     console.log("componentWillUpdate")
    //     // this.Search();
    // }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <TableContainer>
                    <Table
                        className={`tableWrapper`}
                        aria-labelledby="tableTitle"
                        size='medium'
                        aria-label="enhanced table"
                    >
                        <TableHead>
                            <TableRow>
                                {this.state.headTable.map((headCell) => (
                                    <TableCell
                                        key={headCell.FieldName}
                                        align="left"
                                        padding={headCell.isSort ? 'none' : 'default'}
                                        sortDirection={this.state.orderBy === headCell.FieldName ? this.state.order : false}
                                    >
                                        {(headCell.FieldName == "wfTableTitle" || headCell.FieldName == "StatusStep" || headCell.FieldName == "indexStepname" || headCell.FieldName == "Action") ? (
                                            //   <TableSortLabel> {headCell.FieldTitle} </TableSortLabel>
                                            <label> {headCell.FieldTitle} </label>
                                        ) : (
                                                <TableSortLabel
                                                    active={this.state.orderBy === headCell.FieldName}
                                                    direction={this.state.orderBy === headCell.FieldName ? this.state.order : 'asc'}
                                                    onClick={() => this.handleRequestSort(this, headCell.FieldName)}
                                                >
                                                    {headCell.FieldTitle}
                                                    {this.state.orderBy === headCell.FieldName ? (
                                                        <span className={classes.visuallyHidden}>
                                                            {this.state.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                        </span>
                                                    ) : null}
                                                </TableSortLabel>
                                            )}

                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stableSort(this.state.historyRequest, getComparator(this.state.order, this.state.orderBy))
                            .slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                            .map((row, index) => 
                            (
                                <TableRow key={index}>
                                    {Object.keys(row).map((item, keyItem) =>(
                                        <TableCell key={keyItem}> {row[item]} </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        
                        </TableBody>
                    </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={this.state.historyRequest.length}
                        rowsPerPage={this.state.rowsPerPage}
                        page={this.state.page}
                        onChangePage={this.handleChangePage.bind(this)}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                            'onClick': () => this.handleChangePage(this, this.state.page - 1),
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                            'onClick': () => this.handleChangePage(this, this.state.page + 1),
                        }}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage.bind(this)}
                    />
                </Paper>

            </div>
        )
    }

    async Search() {
        this.setState({page: 0});
        let listSearch = await this.SearchList();
        this.setState({
            historyRequest: listSearch
        })
      }
    
      async SearchList() {
        let items = [];
        let ListTypeRequest = this.state.WFStepTable;
        let ListIndexStep= this.state.WFStepTable;

        console.log(sp);

        await sp.web.lists.getByTitle(this.state.SPList).items.select(this.state.selectWFHistory).expand(this.state.expandWFHistory).filter(this.state.filterWFHistory).get().then(
            itemList => {
              itemList.forEach(element => {
                let TypeRequest = ListTypeRequest.find(x => x.ID == element.WFTableId);
                let indexStepTitle = ListIndexStep.find(x=>x.WFTableId==element.WFTableId && x.indexStep==element.indexStep);
                let wfTableTitle = isNotNull(TypeRequest) ? TypeRequest.Title : '';
                let wfTableCode = isNotNull(TypeRequest) ? TypeRequest.Code : '';
                let indexStepname = isNotNull(indexStepTitle) ? indexStepTitle.Title:'';
                let StatusStep = '';
                if (element.indexStep == 1 && element.StatusStep == 0) {
                  StatusStep = <span className={formatStatusLabel(-1)}>{formatStatusText(-1)}</span>;
                }
                else {
                  StatusStep = <span className={formatStatusLabel(element.StatusStep)}>{formatStatusText(element.StatusStep)}</span>;
                }
                let userApp = { UserId: '', UserTitle: '' };
                if (isNotNull(element.UserApproval)) {
                  userApp = { UserId: element.UserApproval.ID, UserTitle: element.UserApproval.Title }
                }
    
                items.push({
                    ItemIndex: element.ItemIndex,
                    Title: <a href={`${config.pages.wfRequestView}?WFTableId=${element.WFTableId}&ItemIndex=${element.ItemIndex}&indexStep=${element.indexStep}`}>{element.Title}</a>,
                    wfTableTitle: wfTableTitle,
                    UserApproval: userApp.UserTitle,
                    indexStepname:indexStepname,
                    StatusStep: StatusStep,
                    DateRequest: formatDate(element.DateRequest),
                    Action: element.StatusRequest == 0 ? <a href={`${config.pages.wfRequestAddNew}?WFTableId=${element.WFTableId}&WFTableCode=${wfTableCode}&ItemId=${element.ItemIndex}&HistoryId=${element.ID}`}><i className="fa fa-edit"></i></a> : ''
                })
              });
            }
          ).catch(
            error => {
              console.log(error);
            }
          )
        // console.log(items);
        return items;
      }

}

AdvanceTable.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(AdvanceTable);