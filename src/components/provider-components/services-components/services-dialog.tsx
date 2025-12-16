"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProviderServiceFormSection } from "./services-form-provider";
import {
  ServiceFormData,
  InsuranceProvider,
  ServiceType,
  PricingModel,
} from "@/components/provider-components/onboarding/step-2/types";
import {
  useCreateService,
  useUpdateService,
} from "@/hooks/use-provider-services-hook";
import {
  getActiveInsuranceProviders,
  createInsuranceProvider,
} from "@/actions/provider/insurance-actions";
import { toast } from "sonner";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    description: string | null;
    type: ServiceType;
    pricingModel: PricingModel;
    fixedPrice: number;
    priceMin: number;
    priceMax: number;
    acceptedInsurances?: Array<{ insuranceProviderId: string }>;
    includedServices?: Array<{ childService: { name: string } }>;
  } | null;
}

export default function ServiceDialog({
  open,
  onOpenChange,
  service,
}: ServiceDialogProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();
  const [insuranceProviders, setInsuranceProviders] = useState<
    InsuranceProvider[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState<ServiceFormData>({
    type: ServiceType.SINGLE,
    name: "",
    description: "",
    pricingModel: PricingModel.FIXED,
    fixedPrice: "",
    minPrice: "",
    maxPrice: "",
    acceptedInsurances: [],
    includedServices: [],
  });

  // Fetch insurance providers
  useEffect(() => {
    const fetchInsuranceProviders = async () => {
      const result = await getActiveInsuranceProviders();
      if (result.success && result.data) {
        setInsuranceProviders(result.data);
      }
    };
    fetchInsuranceProviders();
  }, []);

  // Load service data when editing
  useEffect(() => {
    if (open && service) {
      // Map service data to form data
      setFormData({
        type: service.type || ServiceType.SINGLE,
        name: service.name || "",
        description: service.description || "",
        pricingModel: service.pricingModel || PricingModel.FIXED,
        fixedPrice: service.fixedPrice || "",
        minPrice: service.priceMin || "",
        maxPrice: service.priceMax || "",
        acceptedInsurances:
          service.acceptedInsurances?.map(
            (ai) => ai.insuranceProviderId
          ) || [],
        includedServices:
          service.includedServices?.map((is) => is.childService.name) ||
          [],
      });
    } else if (open && !service) {
      // Reset form for new service
      setFormData({
        type: ServiceType.SINGLE,
        name: "",
        description: "",
        pricingModel: PricingModel.FIXED,
        fixedPrice: "",
        minPrice: "",
        maxPrice: "",
        acceptedInsurances: [],
        includedServices: [],
      });
    }
  }, [open, service]);

  const handleAddInsurance = async (name: string) => {
    const result = await createInsuranceProvider(name, false);
    if (result.success && result.data) {
      setInsuranceProviders((prev) => [...prev, result.data]);
      // Auto-select the newly added insurance
      setFormData((prev) => ({
        ...prev,
        acceptedInsurances: [...prev.acceptedInsurances, result.data.id],
      }));
      toast.success(`${name} added successfully`);
    } else {
      toast.error(result.error || "Failed to add insurance provider");
    }
  };

  const handleSubmit = async (data: ServiceFormData) => {
    // Validate form data
    if (!data.name.trim()) {
      toast.error("Service name is required");
      return;
    }

    setIsSubmitting(true);

    // Prepare service data based on pricing model
    const serviceData: {
      name: string;
      description?: string;
      type: ServiceType;
      pricingModel: PricingModel;
      acceptedInsurances: string[];
      isActive: boolean;
      fixedPrice?: number;
      priceMin?: number;
      priceMax?: number;
      includedServices?: string[];
    } = {
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      type: data.type,
      pricingModel: data.pricingModel,
      acceptedInsurances: data.acceptedInsurances,
      isActive: true,
    };

    // Handle pricing based on model
    if (data.pricingModel === PricingModel.INQUIRE) {
      // No price validation needed for INQUIRE
      serviceData.fixedPrice = 0;
      serviceData.priceMin = 0;
      serviceData.priceMax = 0;
    } else if (data.pricingModel === PricingModel.FIXED) {
      const fixedPrice =
        typeof data.fixedPrice === "number"
          ? data.fixedPrice
          : Number(data.fixedPrice);
      if (data.fixedPrice === "" || isNaN(fixedPrice)) {
        toast.error("Fixed price is required");
        setIsSubmitting(false);
        return;
      }
      serviceData.fixedPrice = fixedPrice;
      serviceData.priceMin = fixedPrice;
      serviceData.priceMax = fixedPrice;
    } else {
      const minPrice =
        typeof data.minPrice === "number"
          ? data.minPrice
          : Number(data.minPrice);
      const maxPrice =
        typeof data.maxPrice === "number"
          ? data.maxPrice
          : Number(data.maxPrice);

      if (
        data.minPrice === "" ||
        data.maxPrice === "" ||
        isNaN(minPrice) ||
        isNaN(maxPrice)
      ) {
        toast.error("Price range is required");
        setIsSubmitting(false);
        return;
      }
      if (maxPrice < minPrice) {
        toast.error(
          "Maximum price must be greater than or equal to minimum price"
        );
        setIsSubmitting(false);
        return;
      }
      serviceData.priceMin = minPrice;
      serviceData.priceMax = maxPrice;
      serviceData.fixedPrice = 0;
    }

    // Handle package services
    if (data.type === ServiceType.PACKAGE) {
      if (data.includedServices.length === 0) {
        toast.error("Package must include at least one service");
        setIsSubmitting(false);
        return;
      }
      serviceData.includedServices = data.includedServices;
    }

    try {
      if (service) {
        // Update existing service
        await updateService.mutateAsync({
          serviceId: service.id,
          data: serviceData,
        });
      } else {
        // Create new service
        await createService.mutateAsync(serviceData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hooks
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
        <ProviderServiceFormSection
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={!!service}
          serviceId={service?.id}
          insuranceProviders={insuranceProviders}
          onAddInsurance={handleAddInsurance}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
