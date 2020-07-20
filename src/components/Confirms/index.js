import React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide} from '@material-ui/core';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction = "up" ref = {ref} {...props} />
});

const ConfirmDialog = ({
    titleDialog, descriptionDialog, open, confirmText, cancelText, handleCancel, handleConfirm
}) => {
    return (
        <Dialog 
            open = {open}
            TransitionComponent = {Transition}
            keepMounted
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">{titleDialog}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    {descriptionDialog}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button  color="primary" onClick={ handleConfirm }>
                    {confirmText}
                </Button>
                <Button onClick={ handleCancel } color="primary" autoFocus>
                    {cancelText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
