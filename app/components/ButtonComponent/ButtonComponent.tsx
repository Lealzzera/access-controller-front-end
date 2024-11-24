import { Button } from "@mui/material";
import { ButtonContainer } from "./styles";

export default function ButtonComponent() {
  return (
    <ButtonContainer>
      <Button fullWidth variant="contained">
        Login
      </Button>
    </ButtonContainer>
  );
}
