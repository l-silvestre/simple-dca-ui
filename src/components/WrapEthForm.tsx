import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useMetaMask } from "../hooks/useMetamask";

export const WrapEthForm = (props: { callback: Function }) => {
  const [ amount, setAmount ] = useState(0);
  const { balance,hasOngoingTransaction, wrapEth } = useMetaMask();

  const handleAmountChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(parseInt(event.target.value));
  };

  const handleClick = async () => {
    await wrapEth(amount);
  }

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-number"
        label="Number"
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{ inputProps: { min: 0, max: balance }}}
        onChange={handleAmountChange}
        value={amount}
        variant="standard"
      />
      <LoadingButton
        size="small"
        onClick={handleClick}
        loading={hasOngoingTransaction}
        loadingIndicator="Loading…"
        variant="outlined"
      >
        Wrap and Proceed
      </LoadingButton>
      <Button variant="contained">Skip</Button>
    </Box>
  )
}