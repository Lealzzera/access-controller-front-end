import { Button, ButtonProps } from "@mui/material";
import { ButtonContainer } from "./styles";

interface ButtonComponentProps extends ButtonProps {
  onClick?: (event: any) => void;
  buttonText: string | React.JSX.Element;
}

export default function ButtonComponent({
  onClick,
  buttonText,
  ...props
}: ButtonComponentProps) {
  return (
    <ButtonContainer>
      <Button {...props} onClick={onClick} fullWidth variant="contained">
        {buttonText}
      </Button>
    </ButtonContainer>
  );
}
