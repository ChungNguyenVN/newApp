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
                            {
                                Object.keys(item).map((key, keyIn) =>
                                    <TableCell key={keyIn}>
                                    {item[key]}
                                    </TableCell>
                                )
                            }
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Grid>
    );
}
export default SimpleTable