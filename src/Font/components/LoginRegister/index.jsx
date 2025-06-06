import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { useAppContext } from "../../contexts/AppContext";
import { authLogin, authRegister } from "../../lib/fetchModelData";
import "./styles.css";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box className="login-tabpanel">{children}</Box>}
    </div>
  );
}

function LoginRegister() {
  const { setUser, setIsLoggedIn } = useAppContext();
  const [tabValue, setTabValue] = useState(0);

  // Login form state
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Registration form state
  const [regData, setRegData] = useState({
    login_name: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Clear errors when switching tabs
    setLoginError("");
    setRegError("");
    setRegSuccess("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const userData = await authLogin({
        login_name: loginName,
        password: loginPassword,
      });

      if (userData.login_name) {
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError(err.message || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegInputChange = (field) => (event) => {
    setRegData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    // Validate password confirmation
    if (regData.password !== regData.confirmPassword) {
      setRegError("Passwords do not match. Please try again.");
      setRegLoading(false);
      return;
    }

    // Validate required fields
    if (
      !regData.login_name ||
      !regData.password ||
      !regData.first_name ||
      !regData.last_name
    ) {
      setRegError(
        "Login name, password, first name, and last name are required."
      );
      setRegLoading(false);
      return;
    }

    try {
      // Prepare user data for registration (exclude confirmPassword)
      const userData = {
        login_name: regData.login_name,
        password: regData.password,
        first_name: regData.first_name,
        last_name: regData.last_name,
        location: regData.location,
        description: regData.description,
        occupation: regData.occupation,
      };

      await authRegister(userData);

      // Show success message and clear form
      setRegSuccess(
        "Registration successful! You can now login with your credentials."
      );
      setRegData({
        login_name: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
      });
    } catch (err) {
      console.error("Registration failed:", err);
      setRegError(err.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };
  return (
    <Container maxWidth="md" className="login-container">
      <Paper elevation={3} className="login-paper">
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* Login Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>

          {loginError && (
            <Alert severity="error" className="login-error">
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} className="login-form">
            <TextField
              fullWidth
              label="Login Name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              margin="normal"
              required
              autoFocus
              disabled={loginLoading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              margin="normal"
              required
              disabled={loginLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-button"
              disabled={loginLoading || !loginName || !loginPassword}
            >
              {loginLoading ? (
                <>
                  <CircularProgress
                    size={20}
                    className="login-loading-spinner"
                  />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </TabPanel>

        {/* Registration Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register New Account
          </Typography>

          {regError && (
            <Alert severity="error" className="login-error">
              {regError}
            </Alert>
          )}

          {regSuccess && (
            <Alert severity="success" className="login-success">
              {regSuccess}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleRegister}
            className="login-form"
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Login Name"
                  value={regData.login_name}
                  onChange={handleRegInputChange("login_name")}
                  required
                  disabled={regLoading}
                  helperText="This will be your unique username"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={regData.password}
                  onChange={handleRegInputChange("password")}
                  required
                  disabled={regLoading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={regData.confirmPassword}
                  onChange={handleRegInputChange("confirmPassword")}
                  required
                  disabled={regLoading}
                  error={
                    regData.password !== regData.confirmPassword &&
                    regData.confirmPassword !== ""
                  }
                  helperText={
                    regData.password !== regData.confirmPassword &&
                    regData.confirmPassword !== ""
                      ? "Passwords do not match"
                      : ""
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={regData.first_name}
                  onChange={handleRegInputChange("first_name")}
                  required
                  disabled={regLoading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={regData.last_name}
                  onChange={handleRegInputChange("last_name")}
                  required
                  disabled={regLoading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={regData.location}
                  onChange={handleRegInputChange("location")}
                  disabled={regLoading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Occupation"
                  value={regData.occupation}
                  onChange={handleRegInputChange("occupation")}
                  disabled={regLoading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={regData.description}
                  onChange={handleRegInputChange("description")}
                  multiline
                  rows={3}
                  disabled={regLoading}
                  helperText="Tell us a bit about yourself"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-button"
              disabled={
                regLoading ||
                !regData.login_name ||
                !regData.password ||
                !regData.first_name ||
                !regData.last_name ||
                regData.password !== regData.confirmPassword
              }
            >
              {regLoading ? (
                <>
                  <CircularProgress
                    size={20}
                    className="login-loading-spinner"
                  />
                  Registering...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default LoginRegister;
