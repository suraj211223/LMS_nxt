"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
} from "@mui/material";
import { PlayCircle, Send, CheckCircle } from "lucide-react";

export default function ReviewDialogue({ open, onClose, topic, onFeedbackSubmit, onApprove, canApprove }) {
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!feedback.trim()) return;

        setIsSubmitting(true);
        try {
            await onFeedbackSubmit(topic.content_id, feedback);
            setFeedback("");
            onClose();
        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!topic) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Review Topic: {topic.name}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                    {/* Video Section */}
                    <Box
                        sx={{
                            p: 2,
                            border: "1px solid #e5e7eb",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            bgcolor: "#f9fafb",
                        }}
                    >
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Video Link
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                {topic.videoLink || "No video link available"}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<PlayCircle size={18} />}
                            onClick={() => window.open(topic.videoLink, "_blank")}
                            disabled={!topic.videoLink}
                            size="small"
                        >
                            Watch
                        </Button>
                    </Box>

                    {/* Additional Link Section */}
                    {topic.additionalLink && canApprove && (
                        <Box
                            sx={{
                                p: 2,
                                border: "1px solid #e5e7eb",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                bgcolor: "#f9fafb",
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Additional Resources
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                    {topic.additionalLink}
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={() => window.open(topic.additionalLink, "_blank")}
                                size="small"
                            >
                                Open
                            </Button>
                        </Box>
                    )}

                    {/* Feedback Section */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Teacher Feedback
                        </Typography>
                        <TextField
                            autoFocus
                            multiline
                            rows={4}
                            fullWidth
                            placeholder="Enter your feedback for the editor here..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Submitting feedback will notify the editor.
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {canApprove && (
                        <Button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to approve this topic?")) {
                                    onApprove(topic.content_id);
                                    onClose();
                                }
                            }}
                            variant="contained" // Changed to contained for better visibility
                            color="success"
                            startIcon={<CheckCircle size={16} />}
                        >
                            Approve
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        endIcon={<Send size={16} />}
                        disabled={!feedback.trim() || isSubmitting}
                    >
                        {isSubmitting ? "Sending..." : "Request Changes"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
