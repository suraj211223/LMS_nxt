"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success && data.redirect) {
        window.location.href = data.redirect;
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "white",
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 6,
        }}
      >
        <Box sx={{ maxWidth: 420, width: "100%" }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", mb: 8, color: "#000" }}
          >
            WELCOME TO LMS
          </Typography>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>Username</Typography>
              <TextField
                fullWidth
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "#000",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                }}
              />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 5 }}>
              <Typography sx={{ mb: 1, fontWeight: 500 }}>Password</Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#333" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "#000",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                }}
              />
            </Box>

            {/* Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 2,
                borderRadius: "50px",
                fontWeight: "bold",
                fontSize: "1rem",
                backgroundColor: "#000",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              {loading ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                "Sign in →"
              )}
            </Button>
          </form>

          <Typography
            variant="caption"
            textAlign="center"
            display="block"
            sx={{ mt: 4, color: "gray" }}
          >
            Learning Management System © 2025
          </Typography>
        </Box>
      </Box>

      {/* Right Blue Panel */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#0b2ea1",
          display: { xs: "none", md: "block" },
        }}
      />
    </Box>
  );
}
