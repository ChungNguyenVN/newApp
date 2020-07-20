import React from 'react';
import { Table, TableBody, TableFooter, TableRow, TableHead, TableCell } from '@material-ui/core';
import { Grid } from '@material-ui/core'


const SimpleTable = ({ tablehead, tablebody, className }) => {
    return (
        <Grid className='tableResponsive'>
            <Table
                className={`tableWrapper ${className ? className : ''}`}>
                <TableHead>
                    <TableRow>
                        {tablehead.map(item => (
                            <TableCell key={item}>{item}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tablebody.map((item, i) => (
                        <TableRow key={i}>
                            <TableCell>{i + 1} </TableCell>
                            <TableCell>
                                {item.titleHistory}
                            </TableCell>
                            <TableCell>
                                {item.typeRequire}
                            </TableCell>
                            <TableCell>
                                {item.userRequest}
                            </TableCell>
                            <TableCell>
                                {item.dateRequire}
                            </TableCell>
                            <TableCell>
                                {item.status && <span className={`badge 
                                                ${
                                    item.status === 'active' && 'badge-success text-success' ||
                                    item.status === 'inactive' && 'badge-danger text-danger' ||
                                    item.status === 'pending' && 'badge-warning text-warning'
                                    }
                                                `}>
                                    {item.status}
                                </span>}
                            </TableCell>
                            <TableCell> {/* Sử dụng if/else điều khiển ẩn hiện thêm 1 tableCell */}
                                {item.actions}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Grid>
    );
}
export default SimpleTable