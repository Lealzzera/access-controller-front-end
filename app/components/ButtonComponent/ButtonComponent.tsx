import { Button, ButtonProps } from "@mui/material";
import { ButtonContainer } from "./styles";

interface ButtonComponentProps extends ButtonProps {
  onClick?: (event: any) => void;
}

export default function ButtonComponent({
  onClick,
  ...props
}: ButtonComponentProps) {
  return (
    <ButtonContainer>
      <Button {...props} onClick={onClick} fullWidth variant="contained">
        Login
      </Button>
    </ButtonContainer>
  );
}
