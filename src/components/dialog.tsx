import { Dialog, DialogProps, styled } from "@mui/material";

const StyledDialog = styled(Dialog)<DialogProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  '& .MuiPaper-root': {
    borderRadius: '32px',
    background: theme.palette.background.default,
  },
}));

export default StyledDialog;