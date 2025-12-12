"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Loader2, Upload, X, Trash2, Info, ShieldCheck, Plus } from 'lucide-react';
import { DocumentType } from '@/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useOnboardingCreateProviderProfileStore } from '@/store/create-provider-profile-store';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OnboardingStepper } from './onboarding-stepper';
import { cn } from '@/lib/utils';


// Override the schema for form submission with proper types
const onboardingDocumentFormSchema = z.object({
    documents: z.array(z.object({
        documentType: z.nativeEnum(DocumentType),
        filePath: z.any(),
    })).optional(),
});

type OnboardingDocumentFormType = z.infer<typeof onboardingDocumentFormSchema>;

// Helper function to get document type label
const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
        [DocumentType.TAX_DOCUMENT]: 'Tax Document',
        [DocumentType.BIR_DOCUMENT]: 'BIR Document',
        [DocumentType.BUSINESS_PERMIT]: 'Business Permit',
        [DocumentType.PROFESSIONAL_LICENSE]: 'Professional License',
        [DocumentType.MEDICAL_LICENSE]: 'Medical License',
        [DocumentType.DTI_REGISTRATION]: 'DTI Registration',
        [DocumentType.BARANGAY_CLEARANCE]: 'Barangay Clearance',
        [DocumentType.VALID_ID]: 'Valid ID',
        [DocumentType.OTHER]: 'Other',
    };
    return labels[type] || type;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function OnboardingStep3DocumentForm() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const { setData, ...storedData } = useOnboardingCreateProviderProfileStore((state) => state);


    const healthcareName = useOnboardingCreateProviderProfileStore((state) => state.healthcareName);
    const categoryId = useOnboardingCreateProviderProfileStore((state) => state.categoryId);
    const description = useOnboardingCreateProviderProfileStore((state) => state.description);
    const email = useOnboardingCreateProviderProfileStore((state) => state.email);
    const phoneNumber = useOnboardingCreateProviderProfileStore((state) => state.phoneNumber);

    const services = useOnboardingCreateProviderProfileStore((state) => state.services);
    const operatingHours = useOnboardingCreateProviderProfileStore((state) => state.operatingHours);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | ''>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const form = useForm<OnboardingDocumentFormType>({
        resolver: zodResolver(onboardingDocumentFormSchema),
        defaultValues: {
            documents: []
        },
        mode: "onChange",
    });

    const {
        control,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = form;

    useEffect(() => {
        // Check if data has been loaded from the store
        if (storedData.documents && storedData.documents.length > 0) {
            reset({
                documents: storedData.documents,
            });
        }
    }, [
        storedData.documents,
        reset
    ]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "documents",
    });

    const documents = getValues("documents");

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate that the file is an image
        if (!file.type.startsWith('image/')) {
            form.setError('documents', {
                type: 'manual',
                message: 'Only image files are accepted. Please select a valid image file.'
            });
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        // Clear any previous errors
        form.clearErrors('documents');
    };

    const handleAddDocument = () => {
        if (!selectedDocumentType || !selectedFile) return;

        append({
            documentType: selectedDocumentType,
            filePath: selectedFile,
        });

        // Reset form
        setSelectedDocumentType('');
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveDocument = (index: number) => {
        remove(index);
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = (data: OnboardingDocumentFormType) => {
        setIsNavigating(true);
        setData(data);
        console.log("Form Data:", data);
        router.push('/provider/onboarding/step-4');
    };

    const canAddDocument = selectedDocumentType && selectedFile;

    useEffect(() => {
        if (!useOnboardingCreateProviderProfileStore.persist.hasHydrated()) return;
        if (!healthcareName || !categoryId || !description || !email || !phoneNumber) {
            router.push('/provider/onboarding/step-1');
        } else if (!services || services.length === 0 || !operatingHours || operatingHours.length === 0) {
            router.push('/provider/onboarding/step-2');
        }
    }, [healthcareName, categoryId, description, email, phoneNumber, router, services, operatingHours]);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Progress Stepper */}
            <OnboardingStepper currentStep={3} />

            {/* Header Section */}
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25">
                    <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">Verification Documents</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
                    Upload documents to verify your healthcare provider status
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 shadow-sm">
                    <CardContent className="p-6">
                        {/* Upload Section */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Document Type & Upload */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                                        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Document</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Select type and upload</p>
                                    </div>
                                </div>

                                {/* Document Type Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="document-type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Document Type
                                    </Label>
                                    <Select
                                        value={selectedDocumentType}
                                        onValueChange={(value) => setSelectedDocumentType(value as DocumentType)}
                                    >
                                        <SelectTrigger
                                            id="document-type"
                                            className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                                        >
                                            <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                            {Object.values(DocumentType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {getDocumentTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* File Upload Section */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload File</Label>
                                    <div
                                        className={cn(
                                            "relative rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer",
                                            selectedFile
                                                ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
                                        )}
                                        onClick={() => !selectedFile && fileInputRef.current?.click()}
                                    >
                                        {selectedFile ? (
                                            <div className="flex items-center gap-4">
                                                {previewUrl ? (
                                                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white shadow-sm">
                                                        <Image
                                                            src={previewUrl}
                                                            alt="Document preview"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-16 w-16 rounded-lg bg-green-100 flex items-center justify-center">
                                                        <FileText className="h-8 w-8 text-green-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearSelectedFile();
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Click to upload
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                    JPG, PNG, WEBP up to 2MB
                                                </p>
                                            </div>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </div>

                                {/* Add Document Button */}
                                <Button
                                    type="button"
                                    onClick={handleAddDocument}
                                    disabled={!canAddDocument}
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md disabled:opacity-50"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Document
                                </Button>
                            </div>

                            {/* Uploaded Documents List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-slate-900 dark:text-white">Uploaded Documents</h3>
                                    {fields.length > 0 && (
                                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                            {fields.length} document{fields.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                {fields.length === 0 ? (
                                    <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                            <FileText className="h-7 w-7 text-slate-400" />
                                        </div>
                                        <p className="mb-1 font-medium text-slate-700 dark:text-slate-300">No documents yet</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Add at least one verification document
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                        {fields.map((field, index) => {
                                            const document = documents?.[index];
                                            if (!document) return null;

                                            const file = document.filePath as File;
                                            return (
                                                <div
                                                    key={field.id}
                                                    className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-3 hover:border-orange-200 dark:hover:border-orange-800/50 transition-colors"
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 shrink-0">
                                                        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {getDocumentTypeLabel(document.documentType)} • {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                                                        onClick={() => handleRemoveDocument(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Validation Message */}
                                {fields.length === 0 && (
                                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-300">At least one document is required</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Validation Errors */}
                        {errors.documents && (
                            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                                <p className="text-xs text-red-700 dark:text-red-300">{errors.documents.message}</p>
                            </div>
                        )}

                        {/* Information Alert */}
                        <div className="mt-6 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 border border-orange-100 dark:border-orange-800/30">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Verification Tips</p>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">
                                        Ensure documents are clear and legible. Valid IDs, licenses, and permits help us verify your provider status quickly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4">
                    <Link href="/provider/onboarding/step-2">
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
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
                        disabled={fields.length === 0 || isNavigating}
                    >
                        {isNavigating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue to Location
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
