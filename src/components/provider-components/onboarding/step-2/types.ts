import { ServiceType, PricingModel } from "@/lib/generated/prisma";

// Re-export Prisma enums for convenience
export { ServiceType, PricingModel };

export interface ServiceFormData {
  type: ServiceType;
  name: string;
  description: string;
  pricingModel: PricingModel;
  fixedPrice: number | '';
  minPrice: number | '';
  maxPrice: number | '';
  acceptedInsurances: string[]; // Array of insurance provider IDs
  // Specific to Package
  includedServices: string[];
}

export interface InsuranceProvider {
  id: string;
  name: string;
}
