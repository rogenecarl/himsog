"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Layers3, Package as PackageIcon } from "lucide-react";
import ServiceDialog from "@/components/provider-components/services-components/services-dialog";
import DeleteConfirmDialog from "@/components/provider-components/services-components/delete-confirmation-dialog";
import { useProviderServices, useToggleServiceActive } from "@/hooks/use-provider-services-hook";

export default function ServiceManagement() {
  const { data: services, isLoading, error } = useProviderServices();
  const toggleActive = useToggleServiceActive();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<NonNullable<typeof services>[number] | null>(null);
  const [deleteService, setDeleteService] = useState<NonNullable<typeof services>[number] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Format price for display (convert cents to currency)
  const formatPrice = (cents: number) => {
    return cents.toString();
  };

  const handleAddService = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEditService = (service: NonNullable<typeof services>[number]) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleServiceDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingService(null);
    }
  };

  const handleDeleteClick = (service: NonNullable<typeof services>[number]) => {
    setDeleteService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setDeleteService(null);
    }
  };

  const handleToggleActive = (serviceId: string, currentStatus: boolean) => {
    toggleActive.mutate({ serviceId, isActive: !currentStatus });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <Skeleton className="h-8 w-64 mb-2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-4 w-80 bg-slate-200 dark:bg-slate-700" />
            </div>
            <Skeleton className="h-10 w-40 bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Services List Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Service Card Skeletons */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-16 h-16 rounded-lg shrink-0 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2 bg-slate-200 dark:bg-slate-700" />
                      <Skeleton className="h-4 w-96 mb-3 bg-slate-200 dark:bg-slate-700" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20 bg-slate-200 dark:bg-slate-700" />
                        <Skeleton className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-slate-700" />
                      <Skeleton className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700" />
                      <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="p-12 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
            <p className="text-destructive dark:text-red-400">
              Failed to load services. Please try again.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Service Management
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Manage services offered at your healthcare facility
            </p>
          </div>
          <Button
            onClick={handleAddService}
            className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Add Service</span>
          </Button>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Layers3 className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Services ({services?.filter((service) => {
                const isPartOfPackage = services.some((s) => 
                  s.type === 'PACKAGE' && 
                  s.includedServices?.some((inc: { childServiceId: string }) => inc.childServiceId === service.id)
                );
                return !isPartOfPackage;
              }).length || 0})
            </h2>
          </div>

          {!services || services.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
              <p className="text-slate-600 dark:text-slate-400">
                No services yet. Click &quot;Add New Service&quot; to get
                started.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {services
                .filter((service) => {
                  // Only show packages and standalone single services
                  // Filter out services that are part of a package
                  const isPartOfPackage = services.some((s) => 
                    s.type === 'PACKAGE' && 
                    s.includedServices?.some((inc: { childServiceId: string }) => inc.childServiceId === service.id)
                  );
                  return !isPartOfPackage;
                })
                .map((service) => {
                const isPackage = service.type === 'PACKAGE';
                const priceDisplay = service.pricingModel === 'FIXED'
                  ? `₱${formatPrice(service.fixedPrice || service.priceMin)}`
                  : service.pricingModel === 'RANGE'
                    ? `₱${formatPrice(service.priceMin)} - ₱${formatPrice(service.priceMax)}`
                    : 'Price upon inquiry';

                return (
                  <Card
                    key={service.id}
                    className="p-4 sm:p-6 hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center shrink-0 ${
                          isPackage
                            ? 'bg-purple-100 dark:bg-purple-900/20'
                            : 'bg-indigo-100 dark:bg-indigo-900/20'
                        }`}>
                          {isPackage ? (
                            <PackageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Layers3 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                              {service.name}
                            </h3>
                            <Badge className={`text-xs ${
                              isPackage
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            }`}>
                              {isPackage ? 'Package' : 'Service'}
                            </Badge>
                          </div>

                          {service.description && service.description.trim() && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                              {service.description}
                            </p>
                          )}

                          {/* Price on mobile */}
                          <p className="text-base sm:hidden font-semibold text-slate-900 dark:text-white mb-2">
                            {priceDisplay}
                          </p>

                          {/* Package included services */}
                          {isPackage && service.includedServices && service.includedServices.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {service.includedServices.map((includedService: { childService: { name: string } }, i: number) => (
                                <span key={i} className="text-[10px] sm:text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-1.5 sm:px-2 py-0.5 rounded">
                                  {includedService.childService.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Insurance badges */}
                          {service.acceptedInsurances && service.acceptedInsurances.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {service.acceptedInsurances.slice(0, 3).map((insurance: { insuranceProvider: { name: string } }, i: number) => (
                                <span key={i} className="text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded">
                                  {insurance.insuranceProvider.name}
                                </span>
                              ))}
                              {service.acceptedInsurances.length > 3 && (
                                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 px-1.5 sm:px-2 py-0.5">
                                  +{service.acceptedInsurances.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                        <p className="hidden sm:block text-lg font-semibold text-slate-900 dark:text-white">
                          {priceDisplay}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={service.isActive}
                            onCheckedChange={() =>
                              handleToggleActive(service.id, service.isActive)
                            }
                            disabled={toggleActive.isPending}
                          />
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteClick(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Service Dialog */}
      <ServiceDialog
        open={isDialogOpen}
        onOpenChange={handleServiceDialogClose}
        service={editingService}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        service={deleteService}
      />
    </main>
  );
}
