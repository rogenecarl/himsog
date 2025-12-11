"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Loader2, Upload, X, Trash2 } from 'lucide-react';
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
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h1 className="mb-2 text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">Provider Verification Documents</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Please upload valid identification documents to verify your healthcare provider status
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
                    <CardContent className="p-6 sm:p-8">
                        {/* Section Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Provider Verification</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Upload your verification documents</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Document Upload Section */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Document Type Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="document-type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Select Document Type
                                    </Label>
                                    <Select
                                        value={selectedDocumentType}
                                        onValueChange={(value) => setSelectedDocumentType(value as DocumentType)}
                                    >
                                        <SelectTrigger id="document-type" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                            <SelectValue placeholder="Choose document type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                                            {Object.values(DocumentType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {getDocumentTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Select the type of document you&apos;re uploading
                                    </p>
                                </div>

                                {/* File Upload Section */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Document</Label>
                                    <div
                                        className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${selectedFile
                                            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                                            : 'border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900 hover:border-slate-400 dark:hover:border-white/20'
                                            }`}
                                    >
                                        {selectedFile ? (
                                            <div className="space-y-4">
                                                {/* File Preview */}
                                                {previewUrl ? (
                                                    <div className="relative">
                                                        <Image
                                                            src={previewUrl}
                                                            alt="Document preview"
                                                            className="mx-auto max-h-32 rounded object-contain"
                                                            height={50}
                                                            width={50}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                            onClick={clearSelectedFile}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <FileText className="mx-auto h-12 w-12 text-green-600" />
                                                        <p className="mt-2 font-medium text-green-700">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-sm text-green-600">
                                                            {formatFileSize(selectedFile.size)}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={clearSelectedFile}
                                                        >
                                                            <X className="mr-1 h-3 w-3" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm font-medium text-gray-700">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    JPG, JPEG, PNG, GIF, SVG, WEBP (MAX. 2MB)
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="mt-3"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    Choose File
                                                </Button>
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
                                    <p className="text-xs text-gray-500">
                                        Accepted formats: JPG, JPEG, PNG, GIF, SVG, WEBP up to 2MB
                                    </p>
                                </div>
                            </div>

                            {/* Add Document Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleAddDocument}
                                    disabled={!canAddDocument}
                                    className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 disabled:opacity-50"
                                >
                                    Add Document
                                </Button>
                            </div>

                            {/* Uploaded Documents List */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-slate-900 dark:text-white">Uploaded Documents</h3>

                                {fields.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-slate-300 dark:border-white/10 p-8 text-center">
                                        <FileText className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                                        <p className="text-slate-500 dark:text-slate-400">No documents uploaded yet</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                            Add documents using the form above
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {fields.map((field, index) => {
                                            const document = documents?.[index];
                                            if (!document) return null;

                                            const file = document.filePath as File;
                                            return (
                                                <div
                                                    key={field.id}
                                                    className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
                                                            <FileText className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {file.name}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span>{getDocumentTypeLabel(document.documentType)}</span>
                                                                <span>•</span>
                                                                <span>{formatFileSize(file.size)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveDocument(index)}
                                                        className="shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="ml-1 hidden sm:inline">Remove</span>
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Validation Errors */}
                            {errors.documents && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700">
                                        {errors.documents.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Information Alert */}
                            <Alert className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertDescription className="text-amber-800 dark:text-amber-200">
                                    <strong>Important:</strong> Ensure your documents are clear, legible, and show all relevant information.
                                    This helps us verify your provider status quickly and accurately.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <Link href="/provider/onboarding/step-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 sm:w-auto"
                        disabled={fields.length === 0 || isNavigating}
                    >
                        {isNavigating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                Next: Location
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
