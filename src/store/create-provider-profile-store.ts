import { CreateProviderInput } from "@/schemas";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { ServiceType, PricingModel } from "@/components/provider-components/onboarding/step-2/types";

// Extended service type for the store
export type ServiceWithInsurance = {
  name: string;
  description: string | null;
  type: ServiceType;
  pricingModel: PricingModel;
  fixedPrice: number;
  priceMin: number;
  priceMax: number;
  acceptedInsurances: string[]; // Array of insurance provider IDs
  includedServices: string[]; // For packages - array of service names
  isActive: boolean;
  sortOrder: number;
};

type OnboardingCreateProviderProfileState = Partial<CreateProviderInput> & {
  services?: ServiceWithInsurance[];
  setData: (data: Partial<CreateProviderInput> & { services?: ServiceWithInsurance[] }) => void;
  clearData: () => void;
  resetStep: (step: keyof CreateProviderInput) => void;
};

export const useOnboardingCreateProviderProfileStore =
  create<OnboardingCreateProviderProfileState>()(
    persist(
      (set) => ({
        // Initial state
        services: [],
        operatingHours: [],
        documents: [],
        
        // Actions
        setData: (data) => set((state) => ({ ...state, ...data })),
        
        clearData: () =>
          set({
            categoryId: undefined,
            healthcareName: undefined,
            description: undefined,
            phoneNumber: undefined,
            email: undefined,
            coverPhoto: undefined,
            address: undefined,
            city: "Digos",
            province: "Davao del Sur",
            latitude: undefined,
            longitude: undefined,
            slotDuration: 30,
            services: [],
            operatingHours: [],
            documents: [],
          }),
        
        resetStep: (step) =>
          set((state) => ({
            ...state,
            [step]: Array.isArray(state[step]) ? [] : undefined,
          })),
      }),
      {
        name: "onboarding-create-provider-profile",
        storage: createJSONStorage(() => localStorage),
      }
    )
  );
