"use client";

import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

const CreateUser = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const userData = { name, department, role, email, password };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        throw new Error("Failed to create user");
      }

      const data = await res.json();
      console.log("User Created:", data);

      // Reset form
      setName("");
      setDepartment("");
      setRole("");
      setEmail("");
      setPassword("");

      onClose(); // close modal after success
    } catch (error) {
      console.error(error);
      alert("Error creating user!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} keepMounted>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" mb={2}>
          Create User
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              label="Department"
              onChange={(e) => setDepartment(e.target.value)}
            >
             
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateUser;
