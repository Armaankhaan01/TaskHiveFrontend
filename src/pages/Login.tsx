import { useContext, useState } from "react";
import { login } from "../api/auth";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchTasks } from "../api/tasks";
import { AddTaskButton, Container, StyledInput, StyledLink } from "../styles";
import { Typography } from "@mui/material";
import { getFontColor } from "../utils";
import { useTheme } from "@emotion/react";
import InputThemeProvider from "../contexts/InputThemeProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setIsAuthenticated } = useContext(UserContext);
  const theme = useTheme();

  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await login({ email, password });
    localStorage.setItem("token", res.data.token);
    setIsAuthenticated(true);
    const tasksRes = await fetchTasks();
    setUser({
      ...res.data.user,
      tasks: tasksRes.data ?? [],
    });
    navigate("/");
  };

  return (
    <>
      <Container style={{ height: "100vh" }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 600,
            color: getFontColor(theme.secondary),
          }}
        >
          Login
        </Typography>
        <InputThemeProvider>
          <StyledInput
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <StyledInput
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <AddTaskButton onClick={handleLogin}>Login</AddTaskButton>
          <p>
            If you don't have an account{" "}
            <StyledLink onClick={() => navigate("/signup")}>Signup</StyledLink>
          </p>
        </InputThemeProvider>
      </Container>
    </>
  );
};

export default Login;
