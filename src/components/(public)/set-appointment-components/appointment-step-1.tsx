"use client"

import { Card } from "@/components/ui/card"
import { Check, Package, Stethoscope, Shield } from "lucide-react"
import { useCreateUserAppointmentStore } from "@/store/create-user-appointment-store"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ServiceType, PricingModel } from "@/lib/generated/prisma"

interface Provider {
  id: string
  healthcareName: string
  services: Array<{
    id: string
    name: string
    description: string | null
    type: ServiceType
    pricingModel: PricingModel
    fixedPrice: number
    priceMin: number
    priceMax: number
    isActive: boolean
    acceptedInsurances: Array<{
      insuranceProvider: {
        id: string
        name: string
      }
    }>
    includedServices: Array<{
      childService: {
        id: string
        name: string
        description: string | null
      }
    }>
  }>
}

interface AppointmentStep1Props {
  provider: Provider
}

export default function AppointmentStep1({ provider }: AppointmentStep1Props) {
  const { selectedServices, setServices } = useCreateUserAppointmentStore();
  
  // Filter out child services - only show top-level services
  const availableServices = provider.services.filter((service) => {
    // Show PACKAGE services
    if (service.type === 'PACKAGE') return true;
    
    // Show SINGLE services that are NOT part of any package
    const isPartOfPackage = provider.services.some(
      (pkg) => pkg.type === 'PACKAGE' && 
      pkg.includedServices.some(
        (included) => included.childService.id === service.id
      )
    );
    
    return !isPartOfPackage;
  });
  
  const handleServiceToggle = (service: Provider["services"][0]) => {
    const isSelected = selectedServices.some((s) => s.id === service.id)
    if (isSelected) {
      setServices(selectedServices.filter((s) => s.id !== service.id))
    } else {
      // Calculate price based on pricing model
      let price = 0;
      if (service.pricingModel === 'FIXED') {
        price = service.fixedPrice;
      } else if (service.pricingModel === 'RANGE') {
        price = service.priceMin; // Use minimum price for range pricing
      }
      // For INQUIRE pricing, price remains 0

      setServices([
        ...selectedServices,
        {
          id: service.id,
          name: service.name,
          price,
        },
      ])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Services</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Choose one or more services you need</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {availableServices.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id)
          const isPackage = service.type === 'PACKAGE'
          const hasInsurance = service.acceptedInsurances.length > 0
          
          return (
            <button
              key={service.id}
              onClick={() => handleServiceToggle(service)}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                isSelected 
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-gray-200 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {/* Checkmark indicator */}
              {isSelected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="pr-8 space-y-3">
                {/* Service Header */}
                <div className="flex items-start gap-2">
                  {isPackage ? (
                    <Package className="h-5 w-5 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                  ) : (
                    <Stethoscope className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                      <Badge 
                        className={cn(
                          "text-xs px-2 py-0.5",
                          isPackage 
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        )}
                      >
                        {isPackage ? 'Package' : 'Single'}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {service.pricingModel === 'FIXED' ? 'Fixed Price:' : service.pricingModel === 'RANGE' ? 'Price Range:' : 'Price:'}
                  </span>
                  <span className={cn(
                    "font-semibold",
                    service.pricingModel === 'INQUIRE'
                      ? "text-gray-500 dark:text-slate-400 italic"
                      : "text-green-600 dark:text-green-400"
                  )}>
                    {service.pricingModel === 'FIXED'
                      ? `₱${service.fixedPrice.toLocaleString()}`
                      : service.pricingModel === 'RANGE'
                        ? `₱${service.priceMin.toLocaleString()} - ₱${service.priceMax.toLocaleString()}`
                        : 'Price upon inquiry'
                    }
                  </span>
                </div>

                {/* Insurance */}
                {hasInsurance && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Shield className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-xs text-gray-600 dark:text-slate-400">
                      {service.acceptedInsurances.slice(0, 2).map(ins => ins.insuranceProvider.name).join(', ')}
                      {service.acceptedInsurances.length > 2 && ` +${service.acceptedInsurances.length - 2} more`}
                    </span>
                  </div>
                )}

                {/* Package includes */}
                {isPackage && service.includedServices.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Includes {service.includedServices.length} service{service.includedServices.length !== 1 ? 's' : ''}:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-0.5">
                      {service.includedServices.slice(0, 3).map((included) => (
                        <li key={included.childService.id} className="flex items-start gap-1">
                          <span className="text-blue-500 dark:text-blue-400">•</span>
                          <span>{included.childService.name}</span>
                        </li>
                      ))}
                      {service.includedServices.length > 3 && (
                        <li className="text-gray-500 dark:text-slate-500">
                          +{service.includedServices.length - 3} more services
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selectedServices.length > 0 && (
        <Card className="border-l-4 border-l-blue-600 bg-blue-50 dark:bg-blue-900/20 p-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">Selected Services ({selectedServices.length})</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{selectedServices.map((s) => s.name).join(", ")}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
