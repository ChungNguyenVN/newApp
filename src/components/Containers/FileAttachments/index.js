import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";


const ITEM_HEIGHT = 48;

export default function FileAttach({urlFile, nameFile, typeOffice, isEditFile}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (spOpen) => {
    handleClose();
    console.log(spOpen + " || " + urlFile);
    if (spOpen == undefined || spOpen == null) spOpen = 0;
    if (spOpen == 0) {
      window.open(urlFile, '_blank');
    }
    else if (spOpen == 1) {
      window.open(urlFile + "?web=1", '_blank');
    }
    else if(spOpen == 3){
        if(typeOffice == 1){
            window.open("ms-word:ofe|u|" + urlFile, '_blank');
        }
        else if(typeOffice == 2){
            window.open("ms-excel:ofe|u|" + urlFile, '_blank');
        }
    }
  }

  return (
    <div style={{display: "flex"}}>
        <div>
            <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
                style={{padding: 0, float: "left"}}
            >
                <MoreVertIcon />
            </IconButton>
        </div>
        <div>
            <p className="fileAttachments">{nameFile}</p>
        </div>
      
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT *4.5,
            width: "20ch"
          }
        }}
      >
        <MenuItem onClick={() => handleSelect(0)} >Tải xuống</MenuItem>
        {isEditFile ? (
          <MenuItem onClick={() => handleSelect(1)} >Mở trên trình duyệt</MenuItem>
        ) : ("")}
        {typeOffice > 0 && isEditFile ? (
            <MenuItem onClick={() => handleSelect(3)} >Mở trên App</MenuItem>
        ) : ("")}
      </Menu>
    </div>
  );
}
