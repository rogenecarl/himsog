"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Stethoscope,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useCreateUserAppointmentStore } from "@/store/create-user-appointment-store";
import { useCreateUserAppointment } from "@/hooks/use-user-appointment-hook";
import { Loader2 } from "lucide-react";
import { formatTime24to12 } from "@/lib/utils/time-format";

interface Provider {
  id: string;
  healthcareName: string;
  address: string;
  phoneNumber: string | null;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string;
    slug: string;
  } | null;
}

interface AppointmentStep3Props {
  provider: Provider;
  onPrevious?: () => void;
}

export default function AppointmentStep3({
  provider,
  onPrevious,
}: AppointmentStep3Props) {
  const user = useUser();

  // Zustand store
  const {
    selectedServices,
    selectedDate: rawSelectedDate,
    selectedTime,
    patientName,
    patientEmail,
    patientPhone,
    notes,
    setPatientInfo,
    getTotalPrice,
    clearData,
  } = useCreateUserAppointmentStore();

  // Ensure selectedDate is always a proper Date object or null
  const selectedDate = rawSelectedDate
    ? rawSelectedDate instanceof Date
      ? rawSelectedDate
      : new Date(rawSelectedDate)
    : null;

  const totalPrice = getTotalPrice();

  // Create appointment mutation
  const createAppointmentMutation = useCreateUserAppointment();

  // Initialize user details with pre-filled data from user context or store
  const [userDetails, setUserDetails] = useState(() => {
    if (!patientName && !patientEmail && user) {
      // Pre-fill from user context if store is empty
      return {
        name: user.name || "",
        email: user.email || "",
        phone: patientPhone || "",
      };
    }
    // Use store values if available
    return {
      name: patientName || "",
      email: patientEmail || "",
      phone: patientPhone || "",
    };
  });

  // Sync to store only when user details change from user input
  useEffect(() => {
    if (user && !patientName && !patientEmail && (userDetails.name || userDetails.email)) {
      setPatientInfo({
        patientName: userDetails.name,
        patientEmail: userDetails.email,
        patientPhone: userDetails.phone,
      });
    }
  }, [user, patientName, patientEmail, userDetails, setPatientInfo]);

  const handleInputChange = (field: string, value: string) => {
    const newDetails = {
      ...userDetails,
      [field]: value,
    };
    setUserDetails(newDetails);

    // Update store
    setPatientInfo({
      patientName: newDetails.name,
      patientEmail: newDetails.email,
      patientPhone: newDetails.phone,
      notes: notes || "",
    });
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Missing appointment date or time");
      return;
    }

    if (!userDetails.name || !userDetails.email) {
      alert("Please fill in all required patient information");
      return;
    }

    const appointmentData = {
      providerId: provider.id,
      selectedServices,
      selectedDate,
      selectedTime,
      patientName: userDetails.name,
      patientEmail: userDetails.email,
      patientPhone: userDetails.phone || undefined,
      totalPrice,
      notes: notes || undefined,
    };

    createAppointmentMutation.mutate(appointmentData, {
      onSuccess: () => {
        clearData(); // Clear store after successful booking
      },
    });
  };

  const isFormValid = userDetails.name && userDetails.email;

  const [appointmentId] = useState(() => `#APT${Date.now().toString().slice(-6)}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Appointment Summary
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Review your details and confirm your appointment
        </p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Left Column - Patient Details */}
        <div className="space-y-6">
          <Card className="p-4 sm:p-6 shadow-sm border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Patient Information
                  </h3>
                  {user ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      We&apos;ve pre-filled your information from your account.
                      You can edit any field if needed.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Please provide your contact information for the
                      appointment.
                    </p>
                  )}
                </div>
                {user && (userDetails.name || userDetails.email) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setUserDetails({
                        name: "",
                        email: "",
                        phone: "",
                      })
                    }
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  Full Name
                  {user && userDetails.name === user.name && (
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded-full">
                      From account
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={userDetails.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`pl-10 h-11 border-slate-300 dark:border-white/10 focus:border-cyan-500 focus:ring-cyan-500 ${
                      user && userDetails.name === user.name
                        ? "bg-cyan-50/50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  Email Address
                  {user && userDetails.email === user.email && (
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded-full">
                      From account
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={userDetails.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 h-11 border-slate-300 dark:border-white/10 focus:border-cyan-500 focus:ring-cyan-500 ${
                      user && userDetails.email === user.email
                        ? "bg-cyan-50/50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Phone Number{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={userDetails.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 h-11 border-slate-300 dark:border-white/10 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Appointment Details */}
          <Card className="p-4 sm:p-6 shadow-sm border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Appointment Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 shrink-0">
                  <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-400">
                    Appointment Date
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {selectedDate?.toLocaleDateString("default", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 shrink-0">
                  <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-400">
                    Appointment Time
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {selectedTime && formatTime24to12(selectedTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 shrink-0">
                  <div className="text-sm">🏥</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-400">
                    Healthcare Provider
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {provider.healthcareName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {provider.address}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Service Summary */}
        <div className="space-y-6">
          <Card className="p-4 sm:p-6 shadow-sm border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Service Summary
              </h3>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Appointment ID</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {appointmentId}
                </p>
              </div>
            </div>

            {/* Services List - Scrollable if more than 3 */}
            <div className={selectedServices.length > 3 ? "relative" : ""}>
              {selectedServices.length > 3 ? (
                <ScrollArea className="h-60 pr-4">
                  <div className="space-y-4">
                    {selectedServices.map((service, index) => (
                      <div
                        key={service.id}
                        className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30 shrink-0">
                          <Stethoscope className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                            {service.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Service #{index + 1}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                            ₱{service.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="space-y-4">
                  {selectedServices.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30 shrink-0">
                        <Stethoscope className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                          {service.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Service #{index + 1}
                        </p>
                      </div>
{/* 
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          ₱{service.price.toLocaleString()}
                        </p>
                      </div> */}
                    </div>
                  ))}
                </div>
              )}

              {/* Scroll indicator for more than 3 services */}
              {selectedServices.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white dark:from-[#1E293B] to-transparent pointer-events-none rounded-b-lg" />
              )}
            </div>

            {/* Pricing Breakdown */}
            {/* <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-400">
                  Subtotal
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₱{totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-400">
                  Service Fee
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₱0.00
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-white/10">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
                  ₱{totalPrice.toLocaleString()}
                </span>
              </div>
            </div> */}
          </Card>

          {/* Important Notes */}
          <Card className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                  Important Reminders
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300/80 space-y-1">
                  <li>• Please arrive 10 minutes before your appointment</li>
                  <li>• Confirmation details will be sent to your email</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-4 sm:bottom-6 bg-white dark:bg-[#1E293B] rounded-lg p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="w-full sm:w-auto sm:min-w-[140px] h-11 sm:h-12 font-semibold border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Previous Step
          </Button>

          <Button
            onClick={handleConfirmAppointment}
            disabled={!isFormValid || createAppointmentMutation.isPending}
            className="w-full sm:flex-1 sm:max-w-md h-12 sm:h-12 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {createAppointmentMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">
                  Confirming Appointment...
                </span>
                <span className="sm:hidden">Confirming...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">
                  {/* Confirm Appointment - ₱{totalPrice.toLocaleString()} */}
                  Confirm Appointment
                </span>
                <span className="sm:hidden">
                  {/* Confirm - ₱{totalPrice.toLocaleString()} */}
                   Confirm
                </span>
              </div>
            )}
          </Button>
        </div>

        {!isFormValid && (
          <p className="text-sm text-red-600 mt-3 text-center max-w-2xl mx-auto">
            Please fill in all required fields to continue
          </p>
        )}

        {createAppointmentMutation.isError && (
          <p className="text-sm text-red-600 mt-3 text-center max-w-2xl mx-auto">
            {createAppointmentMutation.error instanceof Error
              ? createAppointmentMutation.error.message
              : "Failed to create appointment. Please try again."}
          </p>
        )}
      </div>
    </div>
  );
}
