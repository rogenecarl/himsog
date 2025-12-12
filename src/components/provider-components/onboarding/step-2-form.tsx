"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Plus,
    Stethoscope,
    Edit,
    Trash2,
    Package as PackageIcon,
    Layers,
    Info,
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useRouter } from "next/navigation";
import { useOnboardingCreateProviderProfileStore, ServiceWithInsurance } from "@/store/create-provider-profile-store";
import Link from "next/link";
import { FormSection } from "./step-2/service-form";
import { ServiceFormData, ServiceType, PricingModel, InsuranceProvider } from "./step-2/types";
import { getActiveInsuranceProviders, createInsuranceProvider } from "@/actions/provider/insurance-actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { OnboardingStepper } from "./onboarding-stepper";
import { cn } from "@/lib/utils";

// --- CONSTANTS ---
const DEFAULT_OPERATING_HOURS = [
    { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isClosed: true }, // Sunday
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isClosed: false }, // Monday
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isClosed: false }, // Tuesday
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isClosed: false }, // Wednesday
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isClosed: false }, // Thursday
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isClosed: false }, // Friday
    { dayOfWeek: 6, startTime: "09:00", endTime: "12:00", isClosed: false }, // Saturday
];

const onboardingServicesFormSchema = z.object({
    operatingHours: z.array(z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().nullable(),
        endTime: z.string().nullable(),
        isClosed: z.boolean(),
    })).optional(),
});

type OnboardingServicesFormType = z.infer<typeof onboardingServicesFormSchema>;
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDayName(index: number) {
    return dayNames[index] || "";
}

function formatToBackend(timeStr: string): string {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
}

export default function OnboardingStep2ServicesForm() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const { setData, ...storedData } = useOnboardingCreateProviderProfileStore((state) => state);

    const healthcareName = useOnboardingCreateProviderProfileStore((state) => state.healthcareName);
    const categoryId = useOnboardingCreateProviderProfileStore((state) => state.categoryId);
    const description = useOnboardingCreateProviderProfileStore((state) => state.description);
    const email = useOnboardingCreateProviderProfileStore((state) => state.email);
    const phoneNumber = useOnboardingCreateProviderProfileStore((state) => state.phoneNumber);

    // Services state - initialized from store if already hydrated
    const [services, setServices] = useState<ServiceWithInsurance[]>(() => {
        // Try to get initial value from store if already hydrated (e.g., client-side navigation)
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('onboarding-create-provider-profile');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.state?.services && parsed.state.services.length > 0) {
                        return parsed.state.services;
                    }
                }
            } catch {
                // Ignore parse errors
            }
        }
        return [];
    });
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
    const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);

    // Initial service form data
    const getInitialFormData = (): ServiceFormData => ({
        type: ServiceType.SINGLE,
        name: '',
        description: '',
        pricingModel: PricingModel.FIXED,
        fixedPrice: '',
        minPrice: '',
        maxPrice: '',
        acceptedInsurances: [],
        includedServices: [],
    });

    const [serviceFormData, setServiceFormData] = useState<ServiceFormData>(getInitialFormData());

    // React Hook Form setup for operating hours - try to load from localStorage initially
    const getInitialOperatingHours = () => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('onboarding-create-provider-profile');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.state?.operatingHours && parsed.state.operatingHours.length > 0) {
                        return parsed.state.operatingHours;
                    }
                }
            } catch {
                // Ignore parse errors
            }
        }
        return DEFAULT_OPERATING_HOURS;
    };

    const form = useForm<OnboardingServicesFormType>({
        resolver: zodResolver(onboardingServicesFormSchema),
        defaultValues: {
            operatingHours: getInitialOperatingHours(),
        },
        mode: "onChange",
    });

    const {
        handleSubmit,
        setValue,
        getValues,
        formState: { isValid },
    } = form;

    // Fetch insurance providers
    useEffect(() => {
        const fetchInsuranceProviders = async () => {
            const result = await getActiveInsuranceProviders();
            if (result.success && result.data) {
                console.log('✅ Loaded insurance providers from database:', result.data);
                setInsuranceProviders(result.data);
            } else {
                console.error('❌ Failed to load insurance providers:', result.error);
            }
        };
        fetchInsuranceProviders();
    }, []);

    const watchedOperatingHours = getValues("operatingHours");
    const operatingHours = watchedOperatingHours && watchedOperatingHours.length > 0 
        ? watchedOperatingHours 
        : DEFAULT_OPERATING_HOURS;

    // Service management functions
    const handleAddService = () => {
        setEditingServiceIndex(null);
        setServiceFormData(getInitialFormData());
        setShowServiceForm(true);
    };

    const handleEditService = (index: number) => {
        const service = services[index];
        setEditingServiceIndex(index);
        setServiceFormData({
            type: service.type,
            name: service.name,
            description: service.description || '',
            pricingModel: service.pricingModel,
            fixedPrice: service.fixedPrice || '',
            minPrice: service.priceMin || '',
            maxPrice: service.priceMax || '',
            acceptedInsurances: service.acceptedInsurances,
            includedServices: service.includedServices,
        });
        setShowServiceForm(true);
    };

    const handleDeleteService = (index: number) => {
        setServices(prev => prev.filter((_, i) => i !== index));
    };

    const handleServiceSubmit = (data: ServiceFormData) => {
        // Validate
        if (!data.name.trim()) {
            alert("Service/Package name is required");
            return;
        }

        // Convert prices - now using whole numbers directly
        const fixedPrice = data.pricingModel === PricingModel.FIXED 
            ? (typeof data.fixedPrice === 'number' ? data.fixedPrice : 0)
            : 0;
        
        const priceMin = data.pricingModel === PricingModel.RANGE
            ? (typeof data.minPrice === 'number' ? data.minPrice : 0)
            : 0;
        
        const priceMax = data.pricingModel === PricingModel.RANGE
            ? (typeof data.maxPrice === 'number' ? data.maxPrice : 0)
            : 0;

        // Validate price range
        if (data.pricingModel === PricingModel.RANGE && priceMax < priceMin) {
            alert("Maximum price must be greater than or equal to minimum price");
            return;
        }

        // Validate package has services
        if (data.type === ServiceType.PACKAGE && data.includedServices.length === 0) {
            alert("Package must include at least one service");
            return;
        }

        const newService: ServiceWithInsurance = {
            name: data.name.trim(),
            description: data.description.trim() || null,
            type: data.type,
            pricingModel: data.pricingModel,
            fixedPrice,
            priceMin,
            priceMax,
            acceptedInsurances: data.acceptedInsurances,
            includedServices: data.includedServices,
            isActive: true,
            sortOrder: 0,
        };

        if (editingServiceIndex !== null) {
            setServices(prev => prev.map((s, i) => i === editingServiceIndex ? newService : s));
        } else {
            setServices(prev => [...prev, newService]);
        }

        setShowServiceForm(false);
        setServiceFormData(getInitialFormData());
    };

    const handleServiceCancel = () => {
        setShowServiceForm(false);
        setServiceFormData(getInitialFormData());
        setEditingServiceIndex(null);
    };

    // Handle adding new insurance provider
    const handleAddInsurance = async (name: string) => {
        try {
            const result = await createInsuranceProvider(name);
            
            if (result.success && result.data) {
                // Add to local insurance providers list
                setInsuranceProviders(prev => {
                    // Check if already exists
                    if (prev.find(p => p.id === result.data!.id)) {
                        return prev;
                    }
                    return [...prev, { id: result.data!.id, name: result.data!.name }];
                });

                // Auto-select the newly added insurance
                setServiceFormData(prev => ({
                    ...prev,
                    acceptedInsurances: [...prev.acceptedInsurances, result.data!.id]
                }));

                if (result.isNew) {
                    toast.success(`Added "${name}" to insurance providers`);
                } else {
                    toast.info(`"${name}" already exists, added to selection`);
                }
            } else {
                toast.error(result.error || "Failed to add insurance provider");
            }
        } catch (error) {
            console.error("Error adding insurance:", error);
            toast.error("Failed to add insurance provider");
        }
    };

    // Operating hours management
    function handleOperatingHoursChange(
        index: number,
        field: "isClosed" | "startTime" | "endTime",
        value: boolean | string
    ) {
        const updated = [...operatingHours];
        if (field === "isClosed") {
            updated[index].isClosed = value as boolean;
            if (value === true) {
                updated[index].startTime = null;
                updated[index].endTime = null;
            } else {
                if (!updated[index].startTime) updated[index].startTime = "09:00";
                if (!updated[index].endTime) updated[index].endTime = "17:00";
            }
        } else if (field === "startTime") {
            updated[index].startTime = value as string;
        } else if (field === "endTime") {
            updated[index].endTime = value as string;
        }
        setValue("operatingHours", updated, { shouldValidate: true, shouldDirty: true });
    }

    const isAnyDayOpen = operatingHours.some((day) => !day.isClosed);
    const hasOperatingHoursError = operatingHours.some(
        (day) => !day.isClosed && day.startTime && day.endTime && day.endTime <= day.startTime
    );

    // Submit handler
    const onSubmit = (data: OnboardingServicesFormType) => {
        setIsNavigating(true);
        setData({
            services,
            operatingHours: data.operatingHours,
        });
        router.push('/provider/onboarding/step-3');
    };

    useEffect(() => {
        if (!useOnboardingCreateProviderProfileStore.persist.hasHydrated()) return;
        if (!healthcareName || !categoryId || !description || !email || !phoneNumber) {
            router.push('/provider/onboarding/step-1');
        }
    }, [healthcareName, categoryId, description, email, phoneNumber, router]);

    return (
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Progress Stepper */}
            <OnboardingStepper currentStep={2} />

            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                    <Clock className="h-7 w-7 text-white" />
                </div>
                <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">Services & Schedules</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                    Define your healthcare services and set your availability
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Services Card */}
                    <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                        <Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Healthcare Services</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Add services with pricing</p>
                                    </div>
                                </div>
                                {!showServiceForm && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                                        onClick={handleAddService}
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Add
                                    </Button>
                                )}
                            </div>

                            <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
                                <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
                                    <DialogHeader className="sr-only">
                                        <DialogTitle>
                                            {editingServiceIndex !== null ? 'Edit Service' : 'Add Service'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[90vh] overflow-y-auto">
                                        <FormSection
                                            formData={serviceFormData}
                                            setFormData={setServiceFormData}
                                            onSubmit={handleServiceSubmit}
                                            onCancel={handleServiceCancel}
                                            isEditing={editingServiceIndex !== null}
                                            insuranceProviders={insuranceProviders}
                                            onAddInsurance={handleAddInsurance}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                            
                            {services.length === 0 ? (
                                        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
                                            <div className="mb-4 flex justify-center">
                                                <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                    <Stethoscope className="h-8 w-8 text-purple-400" />
                                                </div>
                                            </div>
                                            <p className="mb-1 font-medium text-slate-700 dark:text-slate-300">No services added yet</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                                Add your first service or package to show patients what you offer
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                            {services.map((service, index) => (
                                                <div
                                                    key={index}
                                                    className="group rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-4 hover:border-purple-200 dark:hover:border-purple-800/50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={cn(
                                                                    "h-6 w-6 rounded-md flex items-center justify-center",
                                                                    service.type === ServiceType.SINGLE
                                                                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                                                                        : "bg-purple-100 dark:bg-purple-900/30"
                                                                )}>
                                                                    {service.type === ServiceType.SINGLE ? (
                                                                        <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                                                    ) : (
                                                                        <PackageIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                                    )}
                                                                </div>
                                                                <h3 className="font-medium text-slate-900 dark:text-white truncate">{service.name}</h3>
                                                            </div>
                                                            {service.description && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 ml-8">{service.description}</p>
                                                            )}

                                                            {/* Package included services */}
                                                            {service.type === ServiceType.PACKAGE && service.includedServices.length > 0 && (
                                                                <div className="mt-2 ml-8 flex flex-wrap gap-1">
                                                                    {service.includedServices.slice(0, 2).map((s, i) => (
                                                                        <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                    {service.includedServices.length > 2 && (
                                                                        <span className="text-xs text-slate-500">
                                                                            +{service.includedServices.length - 2} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Insurance badges */}
                                                            {service.acceptedInsurances.length > 0 && (
                                                                <div className="mt-2 ml-8 flex flex-wrap gap-1">
                                                                    {service.acceptedInsurances.slice(0, 2).map((insId, i) => {
                                                                        const provider = insuranceProviders.find(p => p.id === insId);
                                                                        return provider ? (
                                                                            <span key={i} className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                                                                                {provider.name}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                    {service.acceptedInsurances.length > 2 && (
                                                                        <span className="text-xs text-slate-500">
                                                                            +{service.acceptedInsurances.length - 2} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                                                {service.pricingModel === PricingModel.FIXED ? (
                                                                    `₱${service.fixedPrice.toLocaleString()}`
                                                                ) : (
                                                                    `₱${service.priceMin.toLocaleString()} - ₱${service.priceMax.toLocaleString()}`
                                                                )}
                                                            </p>
                                                            <div className="mt-2 flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 p-0"
                                                                    onClick={() => handleEditService(index)}
                                                                >
                                                                    <Edit className="h-3.5 w-3.5 text-slate-500" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                                                                    onClick={() => handleDeleteService(index)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {services.length === 0 && (
                                        <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Add at least one service to continue</p>
                                        </div>
                                    )}
                        </CardContent>
                    </Card>

                    {/* Operating Hours Card */}
                    <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Operating Hours</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Set your weekly schedule</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {operatingHours.map((day, i) => (
                                    <div
                                        key={day.dayOfWeek}
                                        className={cn(
                                            "flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors",
                                            day.isClosed
                                                ? "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-white/5"
                                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-[120px]">
                                            <Switch
                                                checked={!day.isClosed}
                                                onCheckedChange={(checked) =>
                                                    handleOperatingHoursChange(i, "isClosed", !checked)
                                                }
                                            />
                                            <span className={cn(
                                                "font-medium text-sm",
                                                day.isClosed ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                                            )}>
                                                {getDayName(day.dayOfWeek)}
                                            </span>
                                        </div>
                                        {!day.isClosed ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    className={cn(
                                                        "w-[110px] h-9 text-sm bg-white dark:bg-slate-900",
                                                        !day.isClosed && day.startTime && day.endTime && day.endTime <= day.startTime && "border-red-500"
                                                    )}
                                                    value={day.startTime || ""}
                                                    onChange={(e) =>
                                                        handleOperatingHoursChange(i, "startTime", formatToBackend(e.target.value))
                                                    }
                                                    required
                                                />
                                                <span className="text-slate-400 text-xs">to</span>
                                                <Input
                                                    type="time"
                                                    className={cn(
                                                        "w-[110px] h-9 text-sm bg-white dark:bg-slate-900",
                                                        !day.isClosed && day.startTime && day.endTime && day.endTime <= day.startTime && "border-red-500"
                                                    )}
                                                    value={day.endTime || ""}
                                                    onChange={(e) =>
                                                        handleOperatingHoursChange(i, "endTime", formatToBackend(e.target.value))
                                                    }
                                                    required
                                                />
                                                <span className="hidden sm:inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                                                    Open
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Error for time validation */}
                            {hasOperatingHoursError && (
                                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                                    <p className="text-xs text-red-700 dark:text-red-300">End time must be after start time</p>
                                </div>
                            )}

                            {/* Warning if no days open */}
                            {!isAnyDayOpen && (
                                <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">At least one day must be open</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4">
                    <Link href="/provider/onboarding/step-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="border-slate-300 dark:border-white/10"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200"
                        disabled={services.length === 0 || !isAnyDayOpen || !isValid || hasOperatingHoursError || isNavigating}
                    >
                        {isNavigating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue to Documents
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
