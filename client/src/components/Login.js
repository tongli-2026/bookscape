import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { apiUrl } from "../api";

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    textTransform: "none",
  },
  loginButton: {
    backgroundColor: "#6C5DD3",
    color: "white",
    "&:hover": { backgroundColor: "#5A4BC0" },
    marginBottom: "20px",
  },
  googleButton: {
    borderColor: "#4285F4",
    color: "#4285F4",
    "&:hover": {
      borderColor: "#4285F4",
      backgroundColor: "rgba(66, 133, 244, 0.1)",
    },
    marginBottom: "15px",
  },
  divider: {
    margin: "20px 0",
    fontSize: "14px",
  },
  signupLink: {
    textAlign: "center",
    marginTop: "10px",
    fontSize: "14px",
    color: "#0070f3",
    cursor: "pointer",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const Login = () => {
  //state for control login form, signup form, email input, name input, remeber me button, alert message, login user
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSignupVisible, setIsSignupVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [user, setUser] = useState(null);

  //handle user session initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    const redirectUrl = params.get("redirectUrl") || window.location.pathname;

    //parse user data from url parameter
    if (userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        setUser(parsedUser); 
        //save user data to local storage
        localStorage.setItem("user", JSON.stringify(parsedUser));
        //redirect to specific page
        window.location.href = redirectUrl; 
      } catch (error) {
        console.error("Failed to parse user data from URL:", error);
      }
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        // restore user session from localStorage
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);
  

  const handleLogin = async () => {
    try {
      const redirectUrl = window.location.pathname; 
      const response = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirectUrl }),
      });
      const result = await response.json();
      if (response.ok) {
        setAlert({ type: "success", message: "Login successful!" });
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.href = redirectUrl;
      } else {
        setAlert({ type: "error", message: result.message || "Login failed." });
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({ type: "error", message: "An error occurred." });
    }
  };

  //redirects the user to a Google OAuth login URL
  const handleGoogleOAuthRedirect = () => {
    const redirectUrl = window.location.pathname; 
    window.location.href = apiUrl(`/api/google?redirectUrl=${encodeURIComponent(
      redirectUrl
    )}`);
  };

  const handleSignup = async () => {
    try {
      const response = await fetch(apiUrl("/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (response.ok) {
        setAlert({ type: "success", message: "Signup successful!" });
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.reload(); 
      } else {
        setAlert({ type: "error", message: result.message || "Signup failed." });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAlert({ type: "error", message: "An error occurred." });
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <Box>
        {/* show logout button if user is logged in, otherwise show login button */}
        {user ? (
          <Box sx={styles.userBox}>
            <Typography variant="body1"
            sx={{ fontWeight: "bold",  color: "#6C5DD3" }}
            >{user.name}
              
            </Typography>
            <Button
              variant="contained"
              sx={{ ...styles.button, backgroundColor: "#6C5DD3", marginLeft: "10px" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsFormVisible(true)}
            sx={styles.loginButton}
          >
            Login
          </Button>
        )}
      </Box>
      {/* login form section */}
      {isFormVisible && (
        <Box sx={styles.modalOverlay}>
          <Paper sx={styles.modalContainer}>
            <IconButton
              aria-label="close"
              onClick={() => setIsFormVisible(false)}
              sx={styles.closeButton}
            >
              <Close />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              Sign In
            </Typography>
            {alert.message && (
              <Alert severity={alert.type} sx={{ marginBottom: "20px" }}>
                {alert.message}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={{ ...styles.button, ...styles.loginButton }}
            >
              Sign In
            </Button>
            <Divider sx={styles.divider}>Or</Divider>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleOAuthRedirect}
              sx={{ ...styles.button, ...styles.googleButton }}
            >
              <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt="Google"
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
              />
              Sign in with Google
            </Button>
            <Typography
              sx={styles.signupLink}
              onClick={() => {
                setIsFormVisible(false);
                setIsSignupVisible(true);
              }}
            >
              New to Bookscape? Sign up
            </Typography>
          </Paper>
        </Box>
      )}
      {/* sign up form section */}
      {isSignupVisible && (
        <Box sx={styles.modalOverlay}>
          <Paper sx={styles.modalContainer}>
            <IconButton
              aria-label="close"
              onClick={() => setIsSignupVisible(false)}
              sx={styles.closeButton}
            >
              <Close />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              Sign Up
            </Typography>
            {alert.message && (
              <Alert severity={alert.type} sx={{ marginBottom: "20px" }}>
                {alert.message}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSignup}
              sx={{ ...styles.button, ...styles.loginButton }}
            >
              Sign Up
            </Button>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default Login;
