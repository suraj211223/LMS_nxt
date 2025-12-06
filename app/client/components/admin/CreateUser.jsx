"use client";

import React, { useState, useEffect } from "react";
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
  Checkbox,
  FormGroup,
  FormControlLabel
} from "@mui/material";

const CreateUser = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTA, setIsTA] = useState(false);
  const [isPublisher, setIsPublisher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("/api/schools");
        if (res.ok) {
          const data = await res.json();
          setSchools(data || []);
        }
      } catch (e) {
        console.error("Error loading schools:", e);
      }
    };

    if (open) fetchSchools();
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);

    let finalRole = role;
    if (role === 'teacher' && isTA) finalRole = 'teaching assistant';
    if (role === 'editor' && isPublisher) finalRole = 'publisher';

    const userData = { name, department, role: finalRole, email, password };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errData = await res.text();
        throw new Error(errData || "Failed to create user");
      }

      const data = await res.json();
      console.log("User Created:", data);

      // Reset form
      setName("");
      setDepartment("");
      setRole("");
      setEmail("");
      setPassword("");
      setIsTA(false);
      setIsPublisher(false);

      onClose();
      if (window.location.reload) window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error creating user: " + error.message);
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
            <InputLabel>School</InputLabel>
            <Select
              value={department}
              label="School"
              onChange={(e) => setDepartment(e.target.value)}
            >
              <MenuItem value="">
                <em>N/A</em>
              </MenuItem>
              {schools.map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => {
                setRole(e.target.value);
                setIsTA(false);
                setIsPublisher(false);
              }}
            >
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
            </Select>
          </FormControl>

          {role === 'teacher' && (
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={isTA} onChange={(e) => setIsTA(e.target.checked)} />} label="Is Teaching Assistant?" />
            </FormGroup>
          )}

          {role === 'editor' && (
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={isPublisher} onChange={(e) => setIsPublisher(e.target.checked)} />} label="Is Publisher?" />
            </FormGroup>
          )}

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
