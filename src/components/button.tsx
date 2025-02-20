import Button, { ButtonProps } from "@mui/material/Button";
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
  borderRadius: '32px',
  color: theme.palette.secondary.main,
}));

export default StyledButton;