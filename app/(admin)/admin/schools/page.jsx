"use client";

import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, Card, CardContent } from "@mui/material";
import CreateSchoolModal from "../../../client/components/admin/CreateSchoolModal";
import { School as SchoolIcon } from "@mui/icons-material";

function Schools() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function getSchools() {
            try {
                const response = await fetch("/api/schools");
                if (!response.ok) {
                    throw new Error("Failed to fetch schools");
                }
                const data = await response.json();
                setSchools(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        getSchools();
    }, []);

    return (
        <>
            <Box className="pt-25 p-6">
                <div className="flex justify-between items-center mb-4">
                    <Typography
                        variant="h3"
                        component="h1"
                        className="text-5xl font-bold text-gray-800"
                    >
                        Schools / Departments
                    </Typography>
                    <button
                        className="border-2 font-bold text-xl bg-black text-white px-4 py-2 rounded-2xl hover:bg-gray-800 transition"
                        onClick={() => setOpen(true)}
                    >
                        + Add School
                    </button>
                    <CreateSchoolModal open={open} onClose={() => setOpen(false)} />
                </div>
                <Typography variant="subtitle1" className="text-gray-600 mb-6">
                    Manage the various Schools and Departments within the institution.
                </Typography>
            </Box>

            <div className="w-full text-black p-5">
                {loading ? (
                    <Typography className="text-gray-500">Loading schools…</Typography>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {schools.length > 0 ? (
                            schools.map((school) => (
                                <div key={school.id}>
                                    <Card
                                        sx={{
                                            borderRadius: "16px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                            border: '1px solid #2563eb',
                                            height: "100%",
                                            transition: "transform 0.2s",
                                            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }
                                        }}
                                    >
                                        <CardContent className="flex flex-col items-center p-6 text-center gap-4">
                                            <div className="p-3 bg-blue-50 rounded-full">
                                                <SchoolIcon sx={{ fontSize: 40, color: "#2563eb" }} />
                                            </div>
                                            <Typography variant="h6" fontWeight="bold">
                                                {school.name}
                                            </Typography>

                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full">
                                <Box className="text-center py-12">
                                    <Typography variant="h6" className="text-gray-500">
                                        No schools found. Add one to get started.
                                    </Typography>
                                </Box>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default Schools;
