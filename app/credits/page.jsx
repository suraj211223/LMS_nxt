"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Button,
    Container,
    Grid
} from "@mui/material";
import { ArrowBack, GitHub, LinkedIn } from "@mui/icons-material";

const TeamMember = ({ member }) => {
    return (
        <Box
            className="team-card"
            sx={{
                position: "relative",
                "&:hover .glow-effect": {
                    opacity: 0.15
                },
                "&:hover .card-content": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25)"
                }
            }}
        >
            {/* Glow Effect on Hover */}
            <Box
                className="glow-effect"
                sx={{
                    position: "absolute",
                    inset: -2,
                    background: "linear-gradient(45deg, #0b2ea1, #3b82f6)",
                    borderRadius: 4,
                    opacity: 0,
                    filter: "blur(8px)",
                    transition: "opacity 0.4s ease"
                }}
            />

            {/* Card Content */}
            <Box
                className="card-content"
                sx={{
                    position: "relative",
                    bgcolor: "white",
                    borderRadius: 4,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                    p: 4,
                    textAlign: "center"
                }}
            >
                {/* Member Info */}
                <Typography
                    variant="h5"
                    sx={{
                        color: "#0f172a",
                        mb: 1,
                        fontWeight: 700,
                        fontSize: "1.25rem"
                    }}
                >
                    {member.name}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "#64748b",
                        mb: 0.5,
                        fontSize: "0.9rem"
                    }}
                >
                    {member.regNo}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "#64748b",
                        mb: 1,
                        fontSize: "0.9rem"
                    }}
                >
                    {member.dept}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: "#64748b",
                        mb: 3,
                        fontSize: "1rem"
                    }}
                >
                    {member.role}
                </Typography>

                {/* Divider */}
                <Box
                    sx={{
                        width: 60,
                        height: 3,
                        background: "linear-gradient(90deg, #0b2ea1, #3b82f6)",
                        mb: 3,
                        mx: "auto",
                        borderRadius: 2
                    }}
                />

                {/* Connect Section */}
                <Typography
                    variant="body2"
                    sx={{
                        color: "#94a3b8",
                        mb: 2,
                        fontWeight: 500
                    }}
                >
                    Connect with me
                </Typography>

                {/* Social Links */}
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                    <Button
                        href={member.github || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        startIcon={<GitHub sx={{ fontSize: 18 }} />}
                        sx={{
                            px: 3,
                            py: 1.2,
                            bgcolor: "#f8fafc",
                            borderColor: "#e2e8f0",
                            color: "#64748b",
                            borderRadius: 3,
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            "&:hover": {
                                bgcolor: "#0f172a",
                                borderColor: "#0f172a",
                                color: "white",
                                transform: "translateY(-1px)"
                            },
                            transition: "all 0.3s ease"
                        }}
                    >
                        GitHub
                    </Button>

                    <Button
                        href={member.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        startIcon={<LinkedIn sx={{ fontSize: 18 }} />}
                        sx={{
                            px: 3,
                            py: 1.2,
                            bgcolor: "#f8fafc",
                            borderColor: "#e2e8f0",
                            color: "#64748b",
                            borderRadius: 3,
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            "&:hover": {
                                bgcolor: "#0b2ea1",
                                borderColor: "#0b2ea1",
                                color: "white",
                                transform: "translateY(-1px)"
                            },
                            transition: "all 0.3s ease"
                        }}
                    >
                        LinkedIn
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

const CreditsPage = () => {
    const router = useRouter();

    const teamMembers = [
        {
            id: 1,
            name: 'K Suraj Das',
            regNo: '2440224',
            dept: 'Department of Computer Science',
            role: 'Developer',
            github: "https://github.com/suraj211223",
            linkedin: "https://www.linkedin.com/in/suraj-das-8b2896232"
        },
        {
            id: 2,
            name: 'Rithesh K R',
            regNo: '2440233',
            dept: 'Department of Computer Science',
            role: 'Developer',
            github: 'https://github.com/Rithesh077',
            linkedin: 'https://www.linkedin.com/in/rithesh-k-r-284315325'
        },
        {
            id: 3,
            name: 'Aditya Mehta',
            regNo: '2440204',
            dept: 'Department of Computer Science',
            role: 'Developer',
            github: 'https://github.com/AdityaMehta2006',
            linkedin: 'https://www.linkedin.com/in/aditya-mehta-155a40315/'
        }
    ];

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)" }}>
            {/* Decorative Background Elements */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none"
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 384,
                        height: 384,
                        bgcolor: "#dbeafe",
                        borderRadius: "50%",
                        filter: "blur(64px)",
                        opacity: 0.3,
                        transform: "translate(50%, -50%)"
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: 384,
                        height: 384,
                        bgcolor: "#e0e7ff",
                        borderRadius: "50%",
                        filter: "blur(64px)",
                        opacity: 0.3,
                        transform: "translate(-50%, 50%)"
                    }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ position: "relative", py: 4 }}>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push("/login")}
                    sx={{
                        mb: 2,
                        color: "#64748b",
                        "&:hover": {
                            bgcolor: "#f1f5f9"
                        }
                    }}
                >
                    Back to Login
                </Button>

                {/* Thank You Section */}
                <Box sx={{ textAlign: "center", mb: 10, mt: 4 }}>

                    <Typography
                        variant="h3"
                        sx={{
                            color: "#0f172a",
                            mb: 2,
                            fontWeight: "bold",
                            maxWidth: "48rem",
                            mx: "auto"
                        }}
                    >
                        Credits & Acknowledgments
                    </Typography>

                    <Box sx={{ maxWidth: "42rem", mx: "auto" }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "#64748b",
                                lineHeight: 1.5,
                                fontWeight: 400,
                                fontSize: "1rem"
                            }}
                        >
                            We would like to extend our heartfelt gratitude to Dr Ashok Immanuel sir for his guidance and support in making this website a reality.
                        </Typography>
                    </Box>
                </Box>

                {/* Meet The Team Section */}
                <Box sx={{ textAlign: "center", mb: 6 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: "#0f172a",
                            fontWeight: "bold",
                            letterSpacing: "0.02em",
                            position: "relative",
                            display: "inline-block",
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                bottom: -8,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 80,
                                height: 4,
                                background: "linear-gradient(90deg, #0b2ea1, #3b82f6)",
                                borderRadius: 2
                            }
                        }}
                    >
                        Meet The Team
                    </Typography>
                </Box>

                {/* Team Members Grid */}
                <Grid container spacing={4} sx={{ mb: 5, justifyContent: "center" }}>
                    {teamMembers.map((member) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                            <TeamMember member={member} />
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Blue Footer Section */}
            <Box
                sx={{
                    position: "relative",
                    background: "linear-gradient(135deg, #0b2ea1 0%, #0a267d 100%)",
                    py: 3,
                    px: 2
                }}
            >
                {/* Decorative Pattern */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.1,
                        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                        backgroundSize: "40px 40px"
                    }}
                />

                <Box sx={{ position: "relative", textAlign: "center" }}>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "rgba(255, 255, 255, 0.95)",
                            fontSize: "0.9rem"
                        }}
                    >
                        © {new Date().getFullYear()} All Rights Reserved
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default CreditsPage;
