
import { CreateUserAppointmentFormType } from "@/schemas/create-user-appointment.schema";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand/react";

// Utility function to ensure we always have a proper Date object
const ensureDate = (date: Date | string | null): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return null;
};

type CreateUserAppointmentState = CreateUserAppointmentFormType & {
  // Actions
  setData: (data: Partial<CreateUserAppointmentFormType>) => void;
  clearData: () => void;
  
  // Step-specific setters for better UX
  setServices: (services: CreateUserAppointmentFormType["selectedServices"]) => void;
  setDateTime: (date: Date, time: string) => void;
  setPatientInfo: (info: {
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    notes?: string;
  }) => void;
  
  // Computed properties helpers
  getTotalPrice: () => number;
  isStep1Complete: () => boolean;
  isStep2Complete: () => boolean;
  isStep3Complete: () => boolean;
};

const initialState: CreateUserAppointmentFormType = {
  providerId: "",
  selectedServices: [],
  selectedDate: null,
  selectedTime: "",
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  totalPrice: 0,
  notes: "",
};

export const useCreateUserAppointmentStore = create<CreateUserAppointmentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Main data setter
      setData: (data) => {
        set((state) => {
          const newState = { ...state, ...data };
          
          // Ensure selectedDate is a proper Date object
          if (data.selectedDate) {
            newState.selectedDate = ensureDate(data.selectedDate);
          }
          
          // Auto-calculate total price when services change
          if (data.selectedServices) {
            newState.totalPrice = data.selectedServices.reduce(
              (sum, service) => sum + service.price,
              0
            );
          }
          
          return newState;
        });
      },
      
      // Clear all data
      clearData: () => {
        set(initialState);
      },
      
      // Step-specific setters
      setServices: (services) => {
        const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
        set({ selectedServices: services, totalPrice });
      },
      
      setDateTime: (date, time) => {
        set({ selectedDate: ensureDate(date), selectedTime: time });
      },
      
      setPatientInfo: (info) => {
        set({
          patientName: info.patientName,
          patientEmail: info.patientEmail,
          patientPhone: info.patientPhone || "",
          notes: info.notes || "",
        });
      },
      
      // Computed properties
      getTotalPrice: () => {
        const state = get();
        return state.selectedServices.reduce((sum, service) => sum + service.price, 0);
      },
      
      isStep1Complete: () => {
        const state = get();
        return state.providerId !== "" && state.selectedServices.length > 0;
      },
      
      isStep2Complete: () => {
        const state = get();
        const hasValidDate = state.selectedDate && 
          (state.selectedDate instanceof Date || typeof state.selectedDate === 'string');
        return Boolean(hasValidDate && state.selectedTime !== "");
      },
      
      isStep3Complete: () => {
        const state = get();
        return (
          state.patientName !== "" &&
          state.patientEmail !== "" &&
          state.patientEmail.includes("@")
        );
      },
    }),
    {
      name: "create-user-appointment-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist the form data, not the functions
        providerId: state.providerId,
        selectedServices: state.selectedServices,
        selectedDate: state.selectedDate instanceof Date 
          ? state.selectedDate.toISOString() 
          : state.selectedDate,
        selectedTime: state.selectedTime,
        patientName: state.patientName,
        patientEmail: state.patientEmail,
        patientPhone: state.patientPhone,
        totalPrice: state.totalPrice,
        notes: state.notes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.selectedDate) {
          state.selectedDate = ensureDate(state.selectedDate);
        }
      },
    }
  )
);