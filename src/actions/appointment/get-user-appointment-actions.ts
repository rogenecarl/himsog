"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserAppointments() {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("You must be logged in to view appointments");
        }

        // Fetch user's appointments with related data
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                provider: {
                    include: {
                        category: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                services: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        // Convert Decimal fields to numbers for client components
        const serializedAppointments = appointments.map(apt => ({
            ...apt,
            totalPrice: apt.totalPrice ? Number(apt.totalPrice) : 0,
            provider: {
                ...apt.provider,
                latitude: apt.provider.latitude ? Number(apt.provider.latitude) : null,
                longitude: apt.provider.longitude ? Number(apt.provider.longitude) : null,
            },
            services: apt.services.map(s => ({
                ...s,
                priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
            })),
        }));

        return {
            success: true,
            data: serializedAppointments,
        };
    } catch (error) {
        console.error("Error fetching user appointments:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch appointments",
            data: [],
        };
    }
}

export async function getUserAppointmentById(appointmentId: string) {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("You must be logged in to view appointment details");
        }

        // Fetch specific appointment
        const appointment = await prisma.appointment.findUnique({
            where: {
                id: appointmentId,
                userId: session.user.id, // Ensure user can only access their own appointments
            },
            include: {
                provider: {
                    include: {
                        category: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                services: {
                    include: {
                        service: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        // Convert Decimal fields to numbers
        const serializedAppointment = {
            ...appointment,
            totalPrice: appointment.totalPrice ? Number(appointment.totalPrice) : 0,
            provider: {
                ...appointment.provider,
                latitude: appointment.provider.latitude ? Number(appointment.provider.latitude) : null,
                longitude: appointment.provider.longitude ? Number(appointment.provider.longitude) : null,
            },
            services: appointment.services.map(s => ({
                ...s,
                priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
            })),
        };

        return {
            success: true,
            data: serializedAppointment,
        };
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch appointment",
            data: null,
        };
    }
}

export async function getUserUpcomingAppointments() {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("You must be logged in to view appointments");
        }

        const now = new Date();

        // Fetch upcoming appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: session.user.id,
                startTime: {
                    gte: now,
                },
                status: {
                    in: ["PENDING", "CONFIRMED"],
                },
            },
            include: {
                provider: {
                    include: {
                        category: true,
                    },
                },
                services: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                startTime: "asc",
            },
            take: 10, // Limit to next 10 appointments
        });

        // Convert Decimal fields to numbers
        const serializedAppointments = appointments.map(apt => ({
            ...apt,
            totalPrice: apt.totalPrice ? Number(apt.totalPrice) : 0,
            provider: {
                ...apt.provider,
                latitude: apt.provider.latitude ? Number(apt.provider.latitude) : null,
                longitude: apt.provider.longitude ? Number(apt.provider.longitude) : null,
            },
            services: apt.services.map(s => ({
                ...s,
                priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
            })),
        }));

        return {
            success: true,
            data: serializedAppointments,
        };
    } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch upcoming appointments",
            data: [],
        };
    }
}

export async function getUserPastAppointments() {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("You must be logged in to view appointments");
        }

        const now = new Date();

        // Fetch past appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    {
                        startTime: {
                            lt: now,
                        },
                    },
                    {
                        status: {
                            in: ["COMPLETED", "CANCELLED", "NO_SHOW"],
                        },
                    },
                ],
            },
            include: {
                provider: {
                    include: {
                        category: true,
                    },
                },
                services: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
            take: 20, // Limit to last 20 appointments
        });

        // Convert Decimal fields to numbers
        const serializedAppointments = appointments.map(apt => ({
            ...apt,
            totalPrice: apt.totalPrice ? Number(apt.totalPrice) : 0,
            provider: {
                ...apt.provider,
                latitude: apt.provider.latitude ? Number(apt.provider.latitude) : null,
                longitude: apt.provider.longitude ? Number(apt.provider.longitude) : null,
            },
            services: apt.services.map(s => ({
                ...s,
                priceAtBooking: s.priceAtBooking ? Number(s.priceAtBooking) : 0,
            })),
        }));

        return {
            success: true,
            data: serializedAppointments,
        };
    } catch (error) {
        console.error("Error fetching past appointments:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch past appointments",
            data: [],
        };
    }
}

export async function getAppointmentStats() {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("You must be logged in to view appointment stats");
        }

        const now = new Date();

        // Get counts for different appointment statuses
        const [total, upcoming, completed, cancelled] = await Promise.all([
            prisma.appointment.count({
                where: { userId: session.user.id },
            }),
            prisma.appointment.count({
                where: {
                    userId: session.user.id,
                    startTime: { gte: now },
                    status: { in: ["PENDING", "CONFIRMED"] },
                },
            }),
            prisma.appointment.count({
                where: {
                    userId: session.user.id,
                    status: "COMPLETED",
                },
            }),
            prisma.appointment.count({
                where: {
                    userId: session.user.id,
                    status: "CANCELLED",
                },
            }),
        ]);

        return {
            success: true,
            data: {
                total,
                upcoming,
                completed,
                cancelled,
            },
        };
    } catch (error) {
        console.error("Error fetching appointment stats:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch appointment stats",
            data: {
                total: 0,
                upcoming: 0,
                completed: 0,
                cancelled: 0,
            },
        };
    }
}