import { PrismaClient, UserRole, ProviderStatus, ServiceType, PricingModel } from '@/lib/generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

// Default password for all seeded providers
const DEFAULT_PASSWORD = 'provider@123';

// Type definitions
type ServiceData = {
  name: string;
  description: string;
  type: ServiceType;
  pricingModel: PricingModel;
  fixedPrice?: number;
  priceMin?: number;
  priceMax?: number;
  includedServices?: string[]; // For PACKAGE type - names of SINGLE services to include
};

type CategorySlug = 'hospitals' | 'dental-clinics' | 'health-centers' | 'dermatology' | 'veterinary' | 'others';

type ProviderData = {
  healthcareName: string;
  description: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  province: string;
  latitude: Decimal;
  longitude: Decimal;
  categorySlug: CategorySlug;
  coverPhoto: string;
  services: ServiceData[]; // Each provider has unique services
};

// Cover photos for each provider (using Unsplash healthcare images)
const coverPhotos = {
  hospitals: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=400&fit=crop',
  ],
  'dental-clinics': [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=400&fit=crop',
  ],
  'health-centers': [
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1200&h=400&fit=crop',
  ],
  dermatology: [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop',
  ],
  veterinary: [
    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=400&fit=crop',
  ],
  others: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop',
  ],
};

// Provider data - 3 providers per category (18 total) with UNIQUE services each
const providersData: ProviderData[] = [
  // ============================================================================
  // HOSPITALS (3)
  // ============================================================================
  {
    healthcareName: "Metro General Hospital",
    description: "A leading multi-specialty hospital providing comprehensive healthcare services with state-of-the-art facilities and experienced medical professionals dedicated to patient care.",
    phoneNumber: "+63 82 555 1001",
    email: "info@metrogeneral.ph",
    address: "123 Healthcare Avenue, Barangay Aplaya",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7510"),
    longitude: new Decimal("125.3580"),
    categorySlug: "hospitals",
    coverPhoto: coverPhotos.hospitals[0],
    services: [
      { name: "General Consultation", description: "Comprehensive medical examination and consultation with a licensed physician", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 600 },
      { name: "Emergency Room Care", description: "24/7 emergency medical services for urgent conditions", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2000, priceMax: 8000 },
      { name: "Inpatient Admission", description: "Hospital room accommodation with nursing care", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 3000, priceMax: 10000 },
      { name: "Surgical Consultation", description: "Pre-operative assessment and surgical planning", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1000 },
      { name: "ICU Care", description: "Intensive care unit monitoring and treatment", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 8000, priceMax: 25000 },
      { name: "Complete Medical Checkup Package", description: "Full body examination with lab tests and specialist consultations", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 5500, includedServices: ["General Consultation", "Surgical Consultation"] },
    ]
  },
  {
    healthcareName: "Davao South Medical Center",
    description: "Modern hospital facility offering emergency services, surgical procedures, and specialized medical treatments with 24/7 care availability.",
    phoneNumber: "+63 82 555 1002",
    email: "contact@davaosouthmedical.ph",
    address: "456 Health Street, Barangay Zone II",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7485"),
    longitude: new Decimal("125.3620"),
    categorySlug: "hospitals",
    coverPhoto: coverPhotos.hospitals[1],
    services: [
      { name: "Internal Medicine Consultation", description: "Expert consultation for internal organ diseases and conditions", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 700 },
      { name: "Cardiology Checkup", description: "Heart health assessment including ECG and consultation", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1500 },
      { name: "Pulmonology Consultation", description: "Lung and respiratory system evaluation", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 800 },
      { name: "Neurology Assessment", description: "Brain and nervous system examination", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1200 },
      { name: "Gastroenterology Consult", description: "Digestive system evaluation and treatment planning", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 900 },
      { name: "Executive Health Screening", description: "Premium health screening with multiple specialist consultations", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 4500, includedServices: ["Internal Medicine Consultation", "Cardiology Checkup", "Pulmonology Consultation"] },
    ]
  },
  {
    healthcareName: "St. Mary's Community Hospital",
    description: "Community-focused hospital providing affordable quality healthcare with compassionate service and modern medical equipment.",
    phoneNumber: "+63 82 555 1003",
    email: "care@stmaryscommunity.ph",
    address: "789 Wellness Road, Barangay Tres de Mayo",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7525"),
    longitude: new Decimal("125.3550"),
    categorySlug: "hospitals",
    coverPhoto: coverPhotos.hospitals[2],
    services: [
      { name: "Pediatric Consultation", description: "Healthcare consultation for infants, children, and adolescents", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "OB-GYN Consultation", description: "Women's health and prenatal care services", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 600 },
      { name: "Normal Delivery Package", description: "Complete delivery care for normal childbirth", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 25000, priceMax: 35000 },
      { name: "Cesarean Section Package", description: "Complete surgical delivery care", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 45000, priceMax: 65000 },
      { name: "Newborn Care", description: "Post-delivery care and monitoring for newborns", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 3000 },
      { name: "Prenatal Care Package", description: "Complete prenatal monitoring throughout pregnancy", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 8000, includedServices: ["OB-GYN Consultation", "Newborn Care"] },
    ]
  },

  // ============================================================================
  // DENTAL CLINICS (3)
  // ============================================================================
  {
    healthcareName: "Perfect Smile Dental Center",
    description: "Premier dental clinic specializing in cosmetic dentistry, orthodontics, and comprehensive oral care with gentle treatment approach.",
    phoneNumber: "+63 82 555 2001",
    email: "smile@perfectsmile.ph",
    address: "101 Dental Plaza, Barangay San Jose",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7540"),
    longitude: new Decimal("125.3610"),
    categorySlug: "dental-clinics",
    coverPhoto: coverPhotos['dental-clinics'][0],
    services: [
      { name: "Dental Consultation", description: "Comprehensive oral examination and treatment planning", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "Teeth Whitening", description: "Professional in-office teeth whitening treatment", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 5000, priceMax: 12000 },
      { name: "Dental Veneers", description: "Porcelain or composite veneers for smile makeover", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 8000, priceMax: 20000 },
      { name: "Orthodontic Braces", description: "Traditional metal or ceramic braces installation", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 40000, priceMax: 80000 },
      { name: "Invisalign Treatment", description: "Clear aligner orthodontic treatment", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 80000, priceMax: 150000 },
      { name: "Smile Makeover Package", description: "Complete aesthetic dental transformation", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 25000, includedServices: ["Dental Consultation", "Teeth Whitening", "Dental Veneers"] },
    ]
  },
  {
    healthcareName: "Elite Dental Studio",
    description: "Advanced dental studio offering cutting-edge treatments including implants, veneers, and laser dentistry in a comfortable environment.",
    phoneNumber: "+63 82 555 2002",
    email: "book@elitedental.ph",
    address: "202 Smile Avenue, Barangay Cogon",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7465"),
    longitude: new Decimal("125.3640"),
    categorySlug: "dental-clinics",
    coverPhoto: coverPhotos['dental-clinics'][1],
    services: [
      { name: "Dental Implant Consultation", description: "Assessment and planning for dental implant placement", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1000 },
      { name: "Single Tooth Implant", description: "Titanium implant with crown for single tooth replacement", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 50000, priceMax: 80000 },
      { name: "All-on-4 Implants", description: "Full arch restoration with 4 implants", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 350000, priceMax: 500000 },
      { name: "Dental Crown", description: "Porcelain or zirconia crown restoration", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 8000, priceMax: 18000 },
      { name: "Dental Bridge", description: "Fixed bridge to replace missing teeth", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 20000, priceMax: 45000 },
      { name: "Full Mouth Rehabilitation", description: "Complete dental restoration package", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 150000, includedServices: ["Dental Implant Consultation", "Dental Crown", "Dental Bridge"] },
    ]
  },
  {
    healthcareName: "Family Dental Care Plus",
    description: "Family-friendly dental clinic providing preventive care, restorations, and pediatric dentistry services for all ages.",
    phoneNumber: "+63 82 555 2003",
    email: "family@dentalcareplus.ph",
    address: "303 Oral Health Lane, Barangay Dawis",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7490"),
    longitude: new Decimal("125.3565"),
    categorySlug: "dental-clinics",
    coverPhoto: coverPhotos['dental-clinics'][2],
    services: [
      { name: "Oral Prophylaxis", description: "Professional teeth cleaning and scaling", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 800 },
      { name: "Tooth Filling", description: "Composite or amalgam filling for cavities", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 800, priceMax: 2500 },
      { name: "Tooth Extraction", description: "Simple or surgical tooth removal", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 500, priceMax: 3500 },
      { name: "Root Canal Treatment", description: "Endodontic treatment to save infected teeth", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 5000, priceMax: 12000 },
      { name: "Pediatric Dental Care", description: "Gentle dental care for children", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 600 },
      { name: "Family Dental Checkup", description: "Dental checkup for up to 4 family members", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 2500, includedServices: ["Oral Prophylaxis", "Pediatric Dental Care"] },
    ]
  },

  // ============================================================================
  // HEALTH CENTERS (3)
  // ============================================================================
  {
    healthcareName: "Wellness First Health Center",
    description: "Comprehensive primary care facility offering preventive health services, immunizations, and health monitoring for the whole family.",
    phoneNumber: "+63 82 555 3001",
    email: "wellness@wellnessfirst.ph",
    address: "111 Primary Care Street, Barangay Sinawilan",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7555"),
    longitude: new Decimal("125.3595"),
    categorySlug: "health-centers",
    coverPhoto: coverPhotos['health-centers'][0],
    services: [
      { name: "General Health Consultation", description: "Primary care consultation for general health concerns", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 400 },
      { name: "Annual Physical Exam", description: "Comprehensive yearly health assessment", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1500 },
      { name: "Vaccination Services", description: "Immunization for children and adults", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 500, priceMax: 3000 },
      { name: "Health Certificate", description: "Medical certificate for employment or travel", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 300 },
      { name: "Blood Pressure Monitoring", description: "Regular BP check and hypertension management", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 100 },
      { name: "Wellness Screening Package", description: "Complete health screening with vital signs and basic tests", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 2000, includedServices: ["General Health Consultation", "Annual Physical Exam", "Blood Pressure Monitoring"] },
    ]
  },
  {
    healthcareName: "Community Care Clinic",
    description: "Accessible community health center providing affordable consultations, basic laboratory services, and health education programs.",
    phoneNumber: "+63 82 555 3002",
    email: "care@communitycareclinic.ph",
    address: "222 Health Hub Road, Barangay Matti",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7430"),
    longitude: new Decimal("125.3680"),
    categorySlug: "health-centers",
    coverPhoto: coverPhotos['health-centers'][1],
    services: [
      { name: "Walk-in Consultation", description: "No-appointment needed medical consultation", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 350 },
      { name: "Diabetes Screening", description: "Blood sugar testing and diabetes management", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 250 },
      { name: "TB-DOTS Program", description: "Tuberculosis treatment and monitoring program", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 0 },
      { name: "Family Planning Services", description: "Contraceptive counseling and services", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 200, priceMax: 1500 },
      { name: "Senior Citizen Checkup", description: "Health assessment for elderly patients", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 400 },
      { name: "Community Health Package", description: "Affordable health screening for community members", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 800, includedServices: ["Walk-in Consultation", "Diabetes Screening", "Blood Pressure Monitoring"] },
    ]
  },
  {
    healthcareName: "HealthyLife Medical Clinic",
    description: "Modern medical clinic focused on preventive healthcare, chronic disease management, and holistic wellness programs.",
    phoneNumber: "+63 82 555 3003",
    email: "info@healthylifemedical.ph",
    address: "333 Wellness Way, Barangay Kapatagan",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7575"),
    longitude: new Decimal("125.3530"),
    categorySlug: "health-centers",
    coverPhoto: coverPhotos['health-centers'][2],
    services: [
      { name: "Preventive Care Consultation", description: "Health risk assessment and prevention planning", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "Chronic Disease Management", description: "Ongoing care for diabetes, hypertension, etc.", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 600 },
      { name: "Nutrition Counseling", description: "Dietary planning and nutritional guidance", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 800 },
      { name: "Stress Management Program", description: "Counseling for stress and anxiety management", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 700 },
      { name: "Weight Management Consultation", description: "Medical weight loss program consultation", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 900 },
      { name: "Holistic Wellness Package", description: "Complete mind-body wellness assessment and planning", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 3000, includedServices: ["Preventive Care Consultation", "Nutrition Counseling", "Stress Management Program"] },
    ]
  },

  // ============================================================================
  // DERMATOLOGY (3)
  // ============================================================================
  {
    healthcareName: "Radiant Skin Dermatology",
    description: "Expert dermatological services specializing in acne treatment, skin rejuvenation, and advanced cosmetic procedures.",
    phoneNumber: "+63 82 555 4001",
    email: "glow@radiantskin.ph",
    address: "444 Beauty Boulevard, Barangay San Miguel",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7450"),
    longitude: new Decimal("125.3700"),
    categorySlug: "dermatology",
    coverPhoto: coverPhotos.dermatology[0],
    services: [
      { name: "Skin Consultation", description: "Comprehensive skin assessment and diagnosis", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 800 },
      { name: "Acne Treatment Program", description: "Multi-session acne clearing treatment", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2000, priceMax: 5000 },
      { name: "Chemical Peel", description: "Skin exfoliation for improved texture and tone", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2500, priceMax: 6000 },
      { name: "Microdermabrasion", description: "Mechanical exfoliation for skin renewal", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 3000 },
      { name: "LED Light Therapy", description: "Light-based treatment for various skin conditions", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1500 },
      { name: "Acne Clearing Package", description: "Complete acne treatment with follow-up sessions", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 8000, includedServices: ["Skin Consultation", "Acne Treatment Program", "Chemical Peel"] },
    ]
  },
  {
    healthcareName: "DermaCare Specialists",
    description: "Board-certified dermatologists providing medical and aesthetic dermatology treatments with personalized skin care solutions.",
    phoneNumber: "+63 82 555 4002",
    email: "consult@dermacare.ph",
    address: "555 Skin Health Avenue, Barangay Igpit",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7590"),
    longitude: new Decimal("125.3545"),
    categorySlug: "dermatology",
    coverPhoto: coverPhotos.dermatology[1],
    services: [
      { name: "Medical Dermatology Consult", description: "Diagnosis and treatment of skin diseases", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1000 },
      { name: "Psoriasis Treatment", description: "Management of psoriasis and related conditions", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 1500, priceMax: 4000 },
      { name: "Eczema Management", description: "Treatment for eczema and dermatitis", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 1200, priceMax: 3500 },
      { name: "Skin Biopsy", description: "Diagnostic skin tissue sampling and analysis", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 3500 },
      { name: "Mole Removal", description: "Safe removal of moles and skin tags", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 1500, priceMax: 5000 },
      { name: "Skin Disease Management Package", description: "Comprehensive treatment plan for chronic skin conditions", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 6000, includedServices: ["Medical Dermatology Consult", "Psoriasis Treatment", "Eczema Management"] },
    ]
  },
  {
    healthcareName: "Clear Skin Clinic",
    description: "Specialized skin clinic offering laser treatments, chemical peels, and comprehensive solutions for various skin conditions.",
    phoneNumber: "+63 82 555 4003",
    email: "book@clearskin.ph",
    address: "666 Dermis Drive, Barangay Ruparan",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7415"),
    longitude: new Decimal("125.3725"),
    categorySlug: "dermatology",
    coverPhoto: coverPhotos.dermatology[2],
    services: [
      { name: "Laser Consultation", description: "Assessment for laser treatment suitability", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "Laser Hair Removal", description: "Permanent hair reduction treatment", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2000, priceMax: 8000 },
      { name: "Laser Skin Rejuvenation", description: "Fractional laser for skin renewal", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 5000, priceMax: 15000 },
      { name: "Tattoo Removal", description: "Laser tattoo removal treatment", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 3000, priceMax: 10000 },
      { name: "Scar Treatment", description: "Laser treatment for acne scars and keloids", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 4000, priceMax: 12000 },
      { name: "Laser Skin Transformation", description: "Complete laser treatment package for skin improvement", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 20000, includedServices: ["Laser Consultation", "Laser Skin Rejuvenation", "Scar Treatment"] },
    ]
  },

  // ============================================================================
  // VETERINARY (3)
  // ============================================================================
  {
    healthcareName: "Happy Paws Veterinary Clinic",
    description: "Full-service veterinary clinic providing compassionate care for pets including wellness exams, surgeries, and emergency services.",
    phoneNumber: "+63 82 555 5001",
    email: "care@happypaws.ph",
    address: "777 Pet Care Lane, Barangay Dulangan",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7605"),
    longitude: new Decimal("125.3510"),
    categorySlug: "veterinary",
    coverPhoto: coverPhotos.veterinary[0],
    services: [
      { name: "Pet Wellness Exam", description: "Comprehensive health checkup for dogs and cats", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "Puppy/Kitten Vaccination", description: "Core vaccines for young pets", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 500, priceMax: 1500 },
      { name: "Anti-Rabies Vaccination", description: "Rabies vaccination for dogs and cats", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 350 },
      { name: "Deworming Treatment", description: "Internal parasite treatment for pets", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 300 },
      { name: "Pet Microchipping", description: "Permanent pet identification microchip implant", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1500 },
      { name: "Puppy Starter Package", description: "Complete care package for new puppies", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 2500, includedServices: ["Pet Wellness Exam", "Puppy/Kitten Vaccination", "Deworming Treatment"] },
    ]
  },
  {
    healthcareName: "Animal Wellness Center",
    description: "Modern veterinary facility offering preventive care, dental services, and specialized treatments for dogs, cats, and exotic pets.",
    phoneNumber: "+63 82 555 5002",
    email: "pets@animalwellness.ph",
    address: "888 Vet Boulevard, Barangay Binaton",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7380"),
    longitude: new Decimal("125.3750"),
    categorySlug: "veterinary",
    coverPhoto: coverPhotos.veterinary[1],
    services: [
      { name: "Pet Dental Consultation", description: "Oral health assessment for pets", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 400 },
      { name: "Pet Dental Cleaning", description: "Professional teeth cleaning under anesthesia", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2500, priceMax: 5000 },
      { name: "Pet Tooth Extraction", description: "Surgical removal of damaged teeth", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 1500, priceMax: 4000 },
      { name: "Exotic Pet Consultation", description: "Healthcare for birds, reptiles, and small mammals", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 800 },
      { name: "Pet Nutritional Counseling", description: "Diet planning for optimal pet health", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "Pet Dental Care Package", description: "Complete dental care with cleaning and follow-up", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 4000, includedServices: ["Pet Dental Consultation", "Pet Dental Cleaning", "Pet Nutritional Counseling"] },
    ]
  },
  {
    healthcareName: "PetCare Plus Veterinary",
    description: "Comprehensive veterinary services including vaccinations, spay/neuter procedures, and pet boarding with 24-hour monitoring.",
    phoneNumber: "+63 82 555 5003",
    email: "hello@petcareplus.ph",
    address: "999 Animal Health Road, Barangay Colorado",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7620"),
    longitude: new Decimal("125.3485"),
    categorySlug: "veterinary",
    coverPhoto: coverPhotos.veterinary[2],
    services: [
      { name: "Spay Surgery (Female)", description: "Ovariohysterectomy for female dogs/cats", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 3500, priceMax: 6000 },
      { name: "Neuter Surgery (Male)", description: "Castration surgery for male dogs/cats", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2500, priceMax: 4500 },
      { name: "Pet Grooming", description: "Full grooming service including bath and haircut", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 400, priceMax: 1200 },
      { name: "Pet Boarding (Per Day)", description: "Safe overnight pet accommodation", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 500, priceMax: 1000 },
      { name: "Pet Emergency Care", description: "24/7 emergency veterinary services", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 2000, priceMax: 8000 },
      { name: "Spay/Neuter Complete Package", description: "Surgery with pre-op exam and post-op care", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 5000, includedServices: ["Spay Surgery (Female)", "Pet Grooming"] },
    ]
  },

  // ============================================================================
  // OTHERS (3)
  // ============================================================================
  {
    healthcareName: "PhysioFit Rehabilitation Center",
    description: "Professional physical therapy and rehabilitation services for injury recovery, post-surgery care, and chronic pain management.",
    phoneNumber: "+63 82 555 6001",
    email: "rehab@physiofit.ph",
    address: "100 Recovery Road, Barangay Goma",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7635"),
    longitude: new Decimal("125.3460"),
    categorySlug: "others",
    coverPhoto: coverPhotos.others[0],
    services: [
      { name: "Physical Therapy Assessment", description: "Initial evaluation and treatment planning", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 600 },
      { name: "Physical Therapy Session", description: "One-hour rehabilitation therapy session", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 800 },
      { name: "Sports Injury Rehabilitation", description: "Specialized therapy for sports-related injuries", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1000 },
      { name: "Post-Surgery Rehabilitation", description: "Recovery therapy after surgical procedures", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 900 },
      { name: "Therapeutic Massage", description: "Medical massage for pain relief", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 500, priceMax: 1000 },
      { name: "Rehabilitation Starter Package", description: "Assessment plus 5 therapy sessions", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 4500, includedServices: ["Physical Therapy Assessment", "Physical Therapy Session", "Therapeutic Massage"] },
    ]
  },
  {
    healthcareName: "MindCare Counseling Center",
    description: "Mental health services including individual therapy, family counseling, and psychological assessments in a safe, confidential environment.",
    phoneNumber: "+63 82 555 6002",
    email: "support@mindcare.ph",
    address: "200 Wellness Circle, Barangay Lungag",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7395"),
    longitude: new Decimal("125.3770"),
    categorySlug: "others",
    coverPhoto: coverPhotos.others[1],
    services: [
      { name: "Initial Psychological Assessment", description: "Comprehensive mental health evaluation", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 1500 },
      { name: "Individual Therapy Session", description: "One-on-one counseling session (50 minutes)", type: ServiceType.SINGLE, pricingModel: PricingModel.RANGE, priceMin: 1000, priceMax: 2000 },
      { name: "Couples Counseling", description: "Relationship therapy for couples", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 2500 },
      { name: "Family Therapy Session", description: "Counseling for family dynamics and issues", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 3000 },
      { name: "Psychiatric Consultation", description: "Medical evaluation for mental health conditions", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 2000 },
      { name: "Mental Wellness Package", description: "Assessment plus 4 therapy sessions", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 7000, includedServices: ["Initial Psychological Assessment", "Individual Therapy Session", "Psychiatric Consultation"] },
    ]
  },
  {
    healthcareName: "DiagnoLab Medical Laboratory",
    description: "State-of-the-art diagnostic laboratory offering comprehensive blood tests, imaging services, and health screening packages.",
    phoneNumber: "+63 82 555 6003",
    email: "tests@diagnolab.ph",
    address: "300 Lab Avenue, Barangay Soong",
    city: "Digos",
    province: "Davao del Sur",
    latitude: new Decimal("6.7650"),
    longitude: new Decimal("125.3435"),
    categorySlug: "others",
    coverPhoto: coverPhotos.others[2],
    services: [
      { name: "Complete Blood Count (CBC)", description: "Full blood cell analysis", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 250 },
      { name: "Urinalysis", description: "Comprehensive urine analysis", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 150 },
      { name: "Lipid Profile", description: "Cholesterol and triglyceride testing", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 500 },
      { name: "Liver Function Test", description: "Comprehensive liver enzyme panel", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 600 },
      { name: "Kidney Function Test", description: "Creatinine and BUN testing", type: ServiceType.SINGLE, pricingModel: PricingModel.FIXED, fixedPrice: 450 },
      { name: "Executive Lab Package", description: "Complete laboratory screening panel", type: ServiceType.PACKAGE, pricingModel: PricingModel.FIXED, fixedPrice: 1800, includedServices: ["Complete Blood Count (CBC)", "Urinalysis", "Lipid Profile", "Liver Function Test", "Kidney Function Test"] },
    ]
  }
];

// Operating hours template (Monday to Friday: 8AM-5PM, Saturday: 8AM-12PM, Sunday: Closed)
const defaultOperatingHours = [
  { dayOfWeek: 0, startTime: null, endTime: null, isClosed: true }, // Sunday - Closed
  { dayOfWeek: 1, startTime: "08:00", endTime: "17:00", isClosed: false }, // Monday 8AM-5PM
  { dayOfWeek: 2, startTime: "08:00", endTime: "17:00", isClosed: false }, // Tuesday 8AM-5PM
  { dayOfWeek: 3, startTime: "08:00", endTime: "17:00", isClosed: false }, // Wednesday 8AM-5PM
  { dayOfWeek: 4, startTime: "08:00", endTime: "17:00", isClosed: false }, // Thursday 8AM-5PM
  { dayOfWeek: 5, startTime: "08:00", endTime: "17:00", isClosed: false }, // Friday 8AM-5PM
  { dayOfWeek: 6, startTime: "08:00", endTime: "12:00", isClosed: false }, // Saturday 8AM-12PM
];

// Break times for providers
const defaultBreakTimes = [
  { dayOfWeek: 1, name: "Lunch Break", startTime: "12:00", endTime: "13:00" },
  { dayOfWeek: 2, name: "Lunch Break", startTime: "12:00", endTime: "13:00" },
  { dayOfWeek: 3, name: "Lunch Break", startTime: "12:00", endTime: "13:00" },
  { dayOfWeek: 4, name: "Lunch Break", startTime: "12:00", endTime: "13:00" },
  { dayOfWeek: 5, name: "Lunch Break", startTime: "12:00", endTime: "13:00" },
];

async function main() {
  console.log('🌱 Starting provider seeding (v2 - append mode)...');
  console.log('📢 This seeder will ADD new providers without deleting existing ones.\n');

  try {
    // Get existing categories
    console.log('📂 Fetching existing categories...');
    const existingCategories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    if (existingCategories.length === 0) {
      console.error('❌ No categories found in the database. Please create categories first.');
      console.log('Required categories: hospitals, dental-clinics, health-centers, dermatology, veterinary, others');
      return;
    }

    console.log(`✅ Found ${existingCategories.length} existing categories:`);
    existingCategories.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));
    console.log('');

    // Track created providers
    let createdProviders = 0;
    let skippedProviders = 0;

    // Create providers with services and operating hours
    console.log('🏥 Creating providers...\n');

    for (const providerData of providersData) {
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: providerData.email },
        include: { provider: true }
      });

      if (existingUser) {
        console.log(`⏭️  Skipping: ${providerData.healthcareName} (email ${providerData.email} already exists)`);
        skippedProviders++;
        continue;
      }

      // Find the category
      const category = existingCategories.find(cat => cat.slug === providerData.categorySlug);
      if (!category) {
        console.log(`⚠️  Skipping: ${providerData.healthcareName} (category ${providerData.categorySlug} not found)`);
        skippedProviders++;
        continue;
      }

      // Create user for this provider
      const user = await prisma.user.create({
        data: {
          email: providerData.email,
          name: `Dr. ${providerData.healthcareName.split(' ')[0]} Admin`,
          role: UserRole.PROVIDER,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create account with password for login
      const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create provider
      const provider = await prisma.provider.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          healthcareName: providerData.healthcareName,
          description: providerData.description,
          phoneNumber: providerData.phoneNumber,
          email: providerData.email,
          coverPhoto: providerData.coverPhoto,
          address: providerData.address,
          city: providerData.city,
          province: providerData.province,
          latitude: providerData.latitude,
          longitude: providerData.longitude,
          status: ProviderStatus.VERIFIED,
          verifiedAt: new Date(),
          slotDuration: 30
        }
      });

      // Create services for this provider (now unique per provider)
      const services = providerData.services;
      const createdSingleServices: Map<string, string> = new Map(); // name -> id mapping

      if (services) {
        // First, create all SINGLE services
        for (const service of services) {
          if (service.type === ServiceType.SINGLE) {
            const createdService = await prisma.service.create({
              data: {
                providerId: provider.id,
                name: service.name,
                description: service.description,
                type: service.type,
                pricingModel: service.pricingModel,
                fixedPrice: service.fixedPrice || 0,
                priceMin: service.priceMin || 0,
                priceMax: service.priceMax || 0,
                isActive: true,
              }
            });
            createdSingleServices.set(service.name, createdService.id);
          }
        }

        // Then, create PACKAGE services and link included services
        for (const service of services) {
          if (service.type === ServiceType.PACKAGE) {
            const createdPackage = await prisma.service.create({
              data: {
                providerId: provider.id,
                name: service.name,
                description: service.description,
                type: service.type,
                pricingModel: service.pricingModel,
                fixedPrice: service.fixedPrice || 0,
                priceMin: service.priceMin || 0,
                priceMax: service.priceMax || 0,
                isActive: true,
              }
            });

            // Link included services to the package
            if (service.includedServices && service.includedServices.length > 0) {
              for (const includedServiceName of service.includedServices) {
                const includedServiceId = createdSingleServices.get(includedServiceName);
                if (includedServiceId) {
                  await prisma.servicePackage.create({
                    data: {
                      parentPackageId: createdPackage.id,
                      childServiceId: includedServiceId,
                    }
                  });
                }
              }
            }
          }
        }
      }

      // Create operating hours
      for (const hours of defaultOperatingHours) {
        await prisma.operatingHour.create({
          data: {
            providerId: provider.id,
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.startTime,
            endTime: hours.endTime,
            isClosed: hours.isClosed
          }
        });
      }

      // Create break times
      for (const breakTime of defaultBreakTimes) {
        await prisma.breakTime.create({
          data: {
            providerId: provider.id,
            dayOfWeek: breakTime.dayOfWeek,
            name: breakTime.name,
            startTime: breakTime.startTime,
            endTime: breakTime.endTime
          }
        });
      }

      createdProviders++;
      const singleCount = services?.filter(s => s.type === ServiceType.SINGLE).length || 0;
      const packageCount = services?.filter(s => s.type === ServiceType.PACKAGE).length || 0;
      console.log(`✅ Created: ${provider.healthcareName} (${category.name})`);
      console.log(`   📋 Services: ${singleCount} SINGLE + ${packageCount} PACKAGE`);
    }

    console.log('\n🎉 Provider seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories available: ${existingCategories.length}`);
    console.log(`   - Providers created: ${createdProviders}`);
    console.log(`   - Providers skipped (already exist): ${skippedProviders}`);
    console.log(`   - Operating hours per provider: 7 days`);
    console.log(`   - Break times per provider: 5 days (Mon-Fri)`);
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   - Password for all providers: ${DEFAULT_PASSWORD}`);
    console.log(`   - Use each provider's email to login`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
