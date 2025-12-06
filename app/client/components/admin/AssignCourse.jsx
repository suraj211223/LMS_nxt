"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Autocomplete,
    TextField
} from "@mui/material";

const AssignCourse = ({ open, onClose }) => {
    const [userId, setUserId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchUsers();
            fetchCourses();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            if (res.ok) setCourses(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, courseId }),
            });

            if (!res.ok) {
                const txt = await res.text();
                alert("Error: " + txt);
            } else {
                alert("Course assigned successfully!");
                setUserId("");
                setCourseId("");
                onClose();
            }
        } catch (e) {
            alert("Error: " + e.message);
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
                    width: 480,
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                }}
            >
                <Typography variant="h6" mb={3}>
                    Assign Course to User
                </Typography>

                <Stack spacing={3}>
                    {/* USER SELECT */}
                    <FormControl fullWidth>
                        <InputLabel>Select User (Teacher/TA)</InputLabel>
                        <Select
                            value={userId}
                            label="Select User (Teacher/TA)"
                            onChange={(e) => setUserId(e.target.value)}
                        >
                            {users
                                .filter(u => ['teacher', 'teaching assistant'].includes(u.role))
                                .map((u) => (
                                    <MenuItem key={u.id} value={u.id}>
                                        {u.name} ({u.email}) - {u.role}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    {/* COURSE SELECT */}
                    <Autocomplete
                        options={courses}
                        getOptionLabel={(option) => `${option.courseCode} - ${option.title}`}
                        renderInput={(params) => <TextField {...params} label="Select Course" />}
                        onChange={(_, newValue) => setCourseId(newValue ? newValue.id : "")}
                    />

                    <Button
                        variant="contained"
                        disabled={loading}
                        onClick={handleSubmit}
                        size="large"
                    >
                        {loading ? "Assigning..." : "Assign Course"}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default AssignCourse;
