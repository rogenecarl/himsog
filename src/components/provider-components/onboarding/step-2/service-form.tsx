import React, { useState } from 'react';
import { ServiceFormData, ServiceType, PricingModel, InsuranceProvider } from './types';
import { Plus, X, Check, Layers, Package, ShieldCheck } from 'lucide-react';

interface FormSectionProps {
  formData: ServiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  insuranceProviders: InsuranceProvider[];
  onAddInsurance: (name: string) => Promise<void>;
}

export const FormSection: React.FC<FormSectionProps> = ({ formData, setFormData, onSubmit, onCancel, isEditing = false, insuranceProviders, onAddInsurance }) => {
  const [newServiceInput, setNewServiceInput] = useState('');
  const [insuranceInput, setInsuranceInput] = useState('');
  const [isAddingInsurance, setIsAddingInsurance] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const updateField = <K extends keyof ServiceFormData>(key: K, value: ServiceFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleInsurance = (insuranceId: string) => {
    setFormData(prev => {
      const current = prev.acceptedInsurances;
      if (current.includes(insuranceId)) {
        return { ...prev, acceptedInsurances: current.filter(i => i !== insuranceId) };
      } else {
        return { ...prev, acceptedInsurances: [...current, insuranceId] };
      }
    });
  };

  const handleAddInsurance = async () => {
    if (!insuranceInput.trim() || isAddingInsurance) return;
    
    setIsAddingInsurance(true);
    try {
      await onAddInsurance(insuranceInput.trim());
      setInsuranceInput('');
      setShowCustomInput(false); // Hide input after adding
    } finally {
      setIsAddingInsurance(false);
    }
  };

  const handleInsuranceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInsurance();
    }
  };

  const addPackageService = () => {
    if (!newServiceInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      includedServices: [...prev.includedServices, newServiceInput.trim()]
    }));
    setNewServiceInput('');
  };

  const removePackageService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedServices: prev.includedServices.filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPackageService();
    }
  };

  return (
    <div className="bg-white flex flex-col">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          {formData.type === ServiceType.SINGLE ? <Layers className="w-6 h-6 text-indigo-600" /> : <Package className="w-6 h-6 text-purple-600" />}
          Configure {formData.type === ServiceType.SINGLE ? 'Service' : 'Package'}
        </h2>
        <p className="text-slate-500 mt-1">Define the details, pricing, and coverage options.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4 bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => updateField('type', ServiceType.SINGLE)}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-200 ${
              formData.type === ServiceType.SINGLE
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Single Service
          </button>
          <button
            onClick={() => updateField('type', ServiceType.PACKAGE)}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-200 ${
              formData.type === ServiceType.PACKAGE
                ? 'bg-white text-purple-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Package Bundle
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              {formData.type === ServiceType.SINGLE ? 'Service Name' : 'Package Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={formData.type === ServiceType.SINGLE ? "e.g., General Consultation" : "e.g., Annual Physical Exam"}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              placeholder="Describe what is included..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Package Specific: Included Services */}
        {formData.type === ServiceType.PACKAGE && (
          <div className="space-y-3 bg-purple-50 p-5 rounded-xl border border-purple-100">
            <label className="text-sm font-semibold text-purple-900 block">Included Services</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newServiceInput}
                onChange={(e) => setNewServiceInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add service name (e.g., X-Ray)"
                className="flex-1 px-4 py-2.5 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                onClick={addPackageService}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 mt-2">
              {formData.includedServices.length === 0 && (
                <p className="text-sm text-purple-400 italic">No services added yet.</p>
              )}
              {formData.includedServices.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm border border-purple-100 animate-fadeIn">
                  <span className="text-sm text-slate-700">{service}</span>
                  <button
                    onClick={() => removePackageService(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Configuration */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">Pricing Model</label>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.pricingModel === PricingModel.FIXED ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                {formData.pricingModel === PricingModel.FIXED && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
              </div>
              <input
                type="radio"
                name="pricingModel"
                className="hidden"
                checked={formData.pricingModel === PricingModel.FIXED}
                onChange={() => updateField('pricingModel', PricingModel.FIXED)}
              />
              <span className="text-slate-700 font-medium">Fixed Price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.pricingModel === PricingModel.RANGE ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                {formData.pricingModel === PricingModel.RANGE && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
              </div>
              <input
                type="radio"
                name="pricingModel"
                className="hidden"
                checked={formData.pricingModel === PricingModel.RANGE}
                onChange={() => updateField('pricingModel', PricingModel.RANGE)}
              />
              <span className="text-slate-700 font-medium">Price Range</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.pricingModel === PricingModel.INQUIRE ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                {formData.pricingModel === PricingModel.INQUIRE && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
              </div>
              <input
                type="radio"
                name="pricingModel"
                className="hidden"
                checked={formData.pricingModel === PricingModel.INQUIRE}
                onChange={() => updateField('pricingModel', PricingModel.INQUIRE)}
              />
              <span className="text-slate-700 font-medium">No Price</span>
            </label>
          </div>

          {formData.pricingModel !== PricingModel.INQUIRE && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              {formData.pricingModel === PricingModel.FIXED ? (
                <div className="col-span-2 relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">₱</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.fixedPrice}
                    onChange={(e) => updateField('fixedPrice', parseInt(e.target.value) || '')}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-xs font-medium">MIN</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.minPrice}
                      onChange={(e) => updateField('minPrice', parseInt(e.target.value) || '')}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-xs font-medium">MAX</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.maxPrice}
                      onChange={(e) => updateField('maxPrice', parseInt(e.target.value) || '')}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {formData.pricingModel === PricingModel.INQUIRE && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Price will be shown as &quot;Price upon inquiry&quot; to patients.</p>
            </div>
          )}
        </div>

        {/* Insurance Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Accepted Insurance & Payments
          </label>
          
          {/* Available Insurance Options from Database */}
          <div className="flex flex-wrap gap-2">
            {insuranceProviders.map((provider) => {
              const isSelected = formData.acceptedInsurances.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => toggleInsurance(provider.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {provider.name}
                </button>
              );
            })}
            
            {/* "Other" button to add custom insurance */}
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all duration-200 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Other
            </button>
          </div>

          {/* Custom Insurance Input (shown when "Other" is clicked) */}
          {showCustomInput && (
            <div className="flex gap-2 animate-fadeIn">
              <input
                type="text"
                value={insuranceInput}
                onChange={(e) => setInsuranceInput(e.target.value)}
                onKeyDown={handleInsuranceKeyDown}
                placeholder="Enter insurance name (e.g., Local Clinic Insurance)"
                className="flex-1 px-4 py-2.5 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                disabled={isAddingInsurance}
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddInsurance}
                disabled={isAddingInsurance || !insuranceInput.trim()}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingInsurance ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setInsuranceInput('');
                }}
                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Selected Insurance Display */}
          {formData.acceptedInsurances.length === 0 && (
            <p className="text-sm text-slate-400 italic py-2">No insurance options selected yet.</p>
          )}
        </div>

      </div>
      
      {/* Footer / Action */}
      <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 sticky bottom-0">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border-2 border-slate-300 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={() => onSubmit(formData)}
          className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
           <span>{isEditing ? 'Update' : 'Create'} {formData.type === ServiceType.SINGLE ? 'Service' : 'Package'}</span>
        </button>
      </div>
    </div>
  );
};
