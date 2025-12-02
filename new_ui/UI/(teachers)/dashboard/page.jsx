"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Coursecard from '../../teacherscomponents/Coursecard';
import { CircularProgress, Typography, Box, Grid } from '@mui/material';

const Page = () => {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            const fetchCourses = async () => {
                try {
                    const response = await fetch(`/api/teacher/display?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch courses');
                    }
                    const data = await response.json();
                    setCourses(data.courses);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchCourses();
        } else {
            // If no userId, we might want to handle it or just stop loading
            // For now, let's just stop loading to show empty state or error
            setLoading(false);
            // setError("User ID not found in URL."); // Optional: show error if critical
        }
    }, [userId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Courses</h1>
            <Grid container spacing={3}>
                {courses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                        <Coursecard
                            id={course.course_id}
                            courseId={course.course_code}
                            Course={course.name}
                            unitCount={course.unit_count}
                            topicCount={course.topic_count}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default Page;
