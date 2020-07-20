import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, TableContainer, TablePagination, Paper } from '@material-ui/core';

function EnhancedTableHead(props) {
  const { classes, headCells, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.FieldName}
            align='left'
            padding={headCell.isSort ? 'none' : 'default'}
            sortDirection={orderBy === headCell.FieldName ? order : false}
          >
            {/* <TableSortLabel
                active={orderBy === headCell.FieldName}
                direction={orderBy === headCell.FieldName ? order : 'asc'}
                onClick={createSortHandler(headCell.FieldName)}
              >
                {headCell.FieldTitle}
                {orderBy === headCell.FieldName ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel> */}
            {(headCell.FieldName == "wfTableTitle" || headCell.FieldName == "StatusStep" || headCell.FieldName == "indexStepname" || headCell.FieldName == "Action") ? (
              <label> {headCell.FieldTitle} </label>
            ) : (
                <TableSortLabel
                  active={orderBy === headCell.FieldName}
                  direction={orderBy === headCell.FieldName ? order : 'asc'}
                  onClick={createSortHandler(headCell.FieldName)}
                >
                  {headCell.FieldTitle}
                  {orderBy === headCell.FieldName ? (
                    <span className={classes.visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel>
              )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  headCells: PropTypes.array.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
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
}));

export default function FunctionTable(props) {
  const classes = useStyles();

  const handleRequestSort = (event, property) => {
    props.callbackSort(property);
  };

  const handleChangePage = async (event, newPage) => {
    props.callbackNexPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    const rowPage = parseInt(event.target.value, 10)
    props.callbackRowPage(rowPage);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table className={classes.table} aria-labelledby="tableTitle" size='small' aria-label="enhanced table">
            <EnhancedTableHead
              classes={classes}
              order={props.order}
              orderBy={props.orderBy}
              onRequestSort={handleRequestSort}
              headCells={props.dataColumns}
            />

            <TableBody>
              {(props.dataSources)
                .slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index}>
                    {Object.keys(row).map((item, keyItem) => (
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
          count={props.lengthData}
          rowsPerPage={props.rowsPerPage}
          page={props.page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
