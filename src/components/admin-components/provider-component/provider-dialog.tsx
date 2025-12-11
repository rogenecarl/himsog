"use client";

import type { ProviderStatus } from "@/lib/generated/prisma";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  Briefcase,
  User,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type DocumentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface ProviderDetailsData {
  id: string;
  healthcareName: string;
  description: string | null;
  status: ProviderStatus;
  phoneNumber: string | null;
  email: string | null;
  address: string;
  city: string;
  province: string;
  coverPhoto: string | null;
  slotDuration: number;
  createdAt: Date;
  verifiedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
  services?: Array<{
    id: string;
    name: string;
    description: string | null;
    priceMin: number;
    priceMax: number;
    isActive: boolean;
  }>;
  operatingHours?: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isClosed: boolean;
  }>;
  documents?: Array<{
    id: string;
    documentType: string;
    filePath: string;
    verificationStatus: DocumentVerificationStatus;
    verifiedAt: Date | null;
    verifiedById: string | null;
    createdAt: Date;
  }>;
  _count: {
    services: number;
    documents: number;
  };
}

interface ProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderDetailsData | null;
  isLoadingProvider?: boolean;
  onStatusUpdate: (providerId: string, status: ProviderStatus) => void;
  onDocumentStatusUpdate?: (
    documentId: string,
    status: DocumentVerificationStatus
  ) => void;
  isUpdating?: boolean;
  isUpdatingDocument?: boolean;
  updatingDocumentId?: string | null;
}

function ProviderDialogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-5 w-24 bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-white/10" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-20 w-full bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

export function ProviderDialog({
  open,
  onOpenChange,
  provider,
  isLoadingProvider = false,
  onStatusUpdate,
  onDocumentStatusUpdate,
  isUpdating = false,
  isUpdatingDocument = false,
  updatingDocumentId = null,
}: ProviderDialogProps) {
  const handleStatusChange = (newStatus: ProviderStatus) => {
    if (provider && newStatus !== provider.status) {
      onStatusUpdate(provider.id, newStatus);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
  };

  const getStatusVariant = (status: ProviderStatus) => {
    switch (status) {
      case "VERIFIED":
        return "default";
      case "PENDING":
        return "secondary";
      case "SUSPENDED":
        return "destructive";
      case "REJECTED":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getDocumentStatusIcon = (status: DocumentVerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "PENDING":
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getDocumentStatusBadge = (status: DocumentVerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Verified
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Provider Details</DialogTitle>
          <DialogDescription>
            View provider information and update status
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          {isLoadingProvider ? (
            <ProviderDialogSkeleton />
          ) : provider ? (
            <div className="space-y-6">
              {/* Provider Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={provider.user.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {provider.user.name?.[0] || provider.healthcareName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {provider.healthcareName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {provider.user.name || provider.user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusVariant(provider.status)}>
                      {provider.status}
                    </Badge>
                    {provider.category && (
                      <Badge
                        variant="outline"
                        style={{ borderColor: provider.category.color }}
                      >
                        {provider.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {provider.description && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {provider.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{provider.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {provider.email || provider.user.email}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {provider.address}, {provider.city}, {provider.province}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Statistics */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {provider._count.services}
                    </p>
                    <p className="text-xs text-muted-foreground">Services</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {provider._count.documents}
                    </p>
                    <p className="text-xs text-muted-foreground">Documents</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              {provider.services && provider.services.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Services Offered</h4>
                    <div className="space-y-2">
                      {provider.services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-start justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold">
                              ₱{service.priceMin} - ₱{service.priceMax}
                            </p>
                            <Badge
                              variant={service.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Operating Hours */}
              {provider.operatingHours && provider.operatingHours.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Operating Hours (Slot: {provider.slotDuration} mins)
                    </h4>
                    <div className="space-y-2">
                      {provider.operatingHours.map((hour) => (
                        <div
                          key={hour.id}
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                        >
                          <span className="font-medium">
                            {getDayName(hour.dayOfWeek)}
                          </span>
                          <span>
                            {hour.isClosed
                              ? "Closed"
                              : `${formatTime(hour.startTime)} - ${formatTime(hour.endTime)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Documents with Verification Status */}
              {provider.documents && provider.documents.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </h4>
                    <div className="space-y-2">
                      {provider.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getDocumentStatusIcon(doc.verificationStatus)}
                            <div>
                              <p className="font-medium">{doc.documentType}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {formatDate(doc.createdAt)}
                                {doc.verifiedAt && (
                                  <> • Verified {formatDate(doc.verifiedAt)}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDocumentStatusBadge(doc.verificationStatus)}
                            {onDocumentStatusUpdate && (
                              <Select
                                value={doc.verificationStatus}
                                onValueChange={(value) =>
                                  onDocumentStatusUpdate(
                                    doc.id,
                                    value as DocumentVerificationStatus
                                  )
                                }
                                disabled={isUpdatingDocument && updatingDocumentId === doc.id}
                              >
                                <SelectTrigger className="w-[100px] h-8">
                                  {isUpdatingDocument && updatingDocumentId === doc.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <SelectValue />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="VERIFIED">Verify</SelectItem>
                                  <SelectItem value="REJECTED">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.filePath, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Account Information */}
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-medium">{formatDate(provider.createdAt)}</p>
                  </div>
                  {provider.verifiedAt && (
                    <div>
                      <p className="text-muted-foreground">Verified</p>
                      <p className="font-medium">
                        {formatDate(provider.verifiedAt)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">User Account</p>
                    <p className="font-medium">{provider.user.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs">{provider.user.id}</p>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Update Provider Status</h4>
                <div className="flex items-center gap-3">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={provider.status}
                    onValueChange={(value) =>
                      handleStatusChange(value as ProviderStatus)
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger id="status" className="w-[180px]">
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No provider selected</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
