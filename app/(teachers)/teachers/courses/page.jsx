"use client";

import React, { useEffect, useState } from 'react';
import TeacherCoursecard from '@/app/client/components/TeacherCoursecard';
import { CircularProgress, Typography, Box, Grid } from '@mui/material';

const Page = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(`/api/teacher/display`);
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
    }, []);

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
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Your Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <div key={course.course_id} className="flex">
                        <TeacherCoursecard
                            id={course.course_id}
                            courseId={course.course_code}
                            Course={course.name}
                            unitCount={course.unit_count}
                            topicCount={course.topic_count}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;