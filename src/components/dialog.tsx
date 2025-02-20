import Dialog, { DialogProps } from "@mui/material/Dialog";
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)<DialogProps>(() => ({
  '& .MuiPaper-root': {
    borderRadius: '32px',
  },
}));

export default StyledDialog;