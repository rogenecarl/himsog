"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from '@/components/ui/alert';
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

function formatTo12Hour(time24: string | null | undefined): string {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
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

    // Services state - initialize directly from store
    const [services, setServices] = useState<ServiceWithInsurance[]>(() => storedData.services || []);
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

    // React Hook Form setup for operating hours - initialize directly from store
    const form = useForm<OnboardingServicesFormType>({
        resolver: zodResolver(onboardingServicesFormSchema),
        defaultValues: {
            operatingHours: (storedData.operatingHours && storedData.operatingHours.length > 0) 
                ? storedData.operatingHours 
                : DEFAULT_OPERATING_HOURS,
        },
        mode: "onChange",
    });

    const {
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isValid },
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

    // No need for hydration effect - state is initialized directly from store

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
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mx-auto">
                    <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Services & Schedules</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    List your healthcare services and set your provider operating hours
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Services Card */}
                    <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Healthcare Services</h2>
                                </div>
                                {!showServiceForm && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                                        onClick={handleAddService}
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Add Service
                                    </Button>
                                )}
                            </div>
                            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                                Add healthcare services or package bundles with pricing and insurance options
                            </p>

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
                                        <div className="rounded-lg border border-dashed border-slate-300 dark:border-white/10 p-8 text-center">
                                            <div className="mb-4 flex justify-center">
                                                <Stethoscope className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="mb-2 text-slate-500 dark:text-slate-400">No services added yet</p>
                                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                                Click the button above to add your first service or package
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {services.map((service, index) => (
                                                <div key={index} className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {service.type === ServiceType.SINGLE ? (
                                                                    <Layers className="h-4 w-4 text-indigo-600" />
                                                                ) : (
                                                                    <PackageIcon className="h-4 w-4 text-purple-600" />
                                                                )}
                                                                <h3 className="font-medium text-slate-900 dark:text-white">{service.name}</h3>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    service.type === ServiceType.SINGLE 
                                                                        ? 'bg-indigo-100 text-indigo-700' 
                                                                        : 'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                    {service.type === ServiceType.SINGLE ? 'Service' : 'Package'}
                                                                </span>
                                                            </div>
                                                            {service.description && (
                                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{service.description}</p>
                                                            )}
                                                            
                                                            {/* Package included services */}
                                                            {service.type === ServiceType.PACKAGE && service.includedServices.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {service.includedServices.map((s, i) => (
                                                                        <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Insurance badges */}
                                                            {service.acceptedInsurances.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {service.acceptedInsurances.slice(0, 3).map((insId, i) => {
                                                                        const provider = insuranceProviders.find(p => p.id === insId);
                                                                        return provider ? (
                                                                            <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                                                                                {provider.name}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                    {service.acceptedInsurances.length > 3 && (
                                                                        <span className="text-xs text-slate-500">
                                                                            +{service.acceptedInsurances.length - 3} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                                {service.pricingModel === PricingModel.FIXED ? (
                                                                    `₱${service.fixedPrice}`
                                                                ) : (
                                                                    `₱${service.priceMin} - ₱${service.priceMax}`
                                                                )}
                                                            </p>
                                                            <div className="mt-2 flex gap-2 justify-end">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 px-2 text-xs"
                                                                    onClick={() => handleEditService(index)}
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-7 px-2 text-xs"
                                                                    onClick={() => handleDeleteService(index)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {services.length === 0 && (
                                        <Alert variant="destructive" className="mt-4 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>You must add at least one service to continue</AlertDescription>
                                        </Alert>
                                    )}
                        </CardContent>
                    </Card>

                    {/* Operating Hours Card */}
                    <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Operating Hours</h2>
                            </div>
                            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                                Set your provider operating hours for each day of the week
                            </p>
                            <Alert className="mb-4 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    At least one day must be open with operating hours
                                </AlertDescription>
                            </Alert>
                            <div className="space-y-4">
                                {operatingHours.map((day, i) => (
                                    <div
                                        key={day.dayOfWeek}
                                        className="flex flex-col sm:flex-row items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Switch
                                                checked={!day.isClosed}
                                                onCheckedChange={(checked) =>
                                                    handleOperatingHoursChange(i, "isClosed", !checked)
                                                }
                                            />
                                            <span className="font-medium">{getDayName(day.dayOfWeek)}</span>
                                        </div>
                                        {!day.isClosed ? (
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <div className="relative">
                                                    <Input
                                                        type="time"
                                                        className={`w-32 ${!day.isClosed && day.startTime && day.endTime && day.endTime <= day.startTime ? 'border-red-500' : ''}`}
                                                        value={day.startTime || ""}
                                                        onChange={(e) =>
                                                            handleOperatingHoursChange(i, "startTime", formatToBackend(e.target.value))
                                                        }
                                                        required
                                                    />
                                                </div>
                                                <span className="text-gray-500">to</span>
                                                <div className="relative">
                                                    <Input
                                                        type="time"
                                                        className={`w-32 ${!day.isClosed && day.startTime && day.endTime && day.endTime <= day.startTime ? 'border-red-500' : ''}`}
                                                        value={day.endTime || ""}
                                                        onChange={(e) =>
                                                            handleOperatingHoursChange(i, "endTime", formatToBackend(e.target.value))
                                                        }
                                                        required
                                                    />
                                                    {!day.isClosed && day.startTime && day.endTime && day.endTime <= day.startTime && (
                                                        <div className="absolute -bottom-5 left-0 w-64 text-xs text-red-500">
                                                            End time must be after {formatTo12Hour(day.startTime)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                                                    Open
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 w-full sm:w-auto text-center sm:text-left">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.operatingHours && (
                                <p className="mt-2 text-red-600 text-sm">{errors.operatingHours.message}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                    <Link href="/provider/onboarding/step-1" className="flex items-center justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center justify-center border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 flex items-center justify-center"
                        disabled={services.length === 0 || !isAnyDayOpen || !isValid || hasOperatingHoursError || isNavigating}
                    >
                        {isNavigating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : hasOperatingHoursError ? (
                            <div className="flex flex-col items-center">
                                <span>Fix Operating Hours Errors</span>
                                <span className="text-xs">Check end times are after start times</span>
                            </div>
                        ) : (
                            <>
                                Next: Documents
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
