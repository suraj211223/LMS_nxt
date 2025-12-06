"use client";

import React, { useState } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
} from "@mui/material";

const CreateSchoolModal = ({ open, onClose }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/schools", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                throw new Error("Failed to create school");
            }

            const data = await res.json();
            console.log("School Created:", data);
            setName("");
            onClose();
            // Optional: Trigger refresh
            if (window.location.reload) window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error creating school");
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
                    width: 400,
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                }}
            >
                <Typography variant="h6" mb={2} fontWeight="bold">
                    Add New School
                </Typography>

                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        label="School Name"
                        placeholder="e.g. School of Management"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        disabled={loading || !name}
                        onClick={handleSubmit}
                        size="large"
                        sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
                    >
                        {loading ? "Creating..." : "Create School"}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default CreateSchoolModal;
