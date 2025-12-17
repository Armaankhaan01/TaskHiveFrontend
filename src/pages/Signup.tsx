import { useContext, useState } from "react";
import { getProfile, register } from "../api/auth";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchTasks } from "../api/tasks";
import { AddTaskButton, Container, StyledInput, StyledLink } from "../styles";
import { Typography } from "@mui/material";
import { getFontColor } from "../utils";
import { useTheme } from "@emotion/react";
import InputThemeProvider from "../contexts/InputThemeProvider";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setIsAuthenticated } = useContext(UserContext);
  const theme = useTheme();

  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await register({ email, password, name });
    localStorage.setItem("token", res.data.token);
    setIsAuthenticated(true);
    const profileRes = await getProfile();

    const tasksRes = await fetchTasks();
    setUser({
      ...profileRes.data,
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
            marginBottom: "25px",
          }}
        >
          Signup
        </Typography>
        <InputThemeProvider>
          <StyledInput placeholder="Name" onChange={(e) => setName(e.target.value)} value={name} />
          <StyledInput
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
          />
          <StyledInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AddTaskButton onClick={handleLogin}>Signup</AddTaskButton>
          <p>
            If you already have an account{" "}
            <StyledLink onClick={() => navigate("/login")}>Login</StyledLink>
          </p>
        </InputThemeProvider>
      </Container>
    </>
  );
};

export default Signup;
