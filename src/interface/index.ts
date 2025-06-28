export interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  googleId: string | null;
  jobTitle: string;
  referral: string;
  refreshToken: string | null;
  otp: string | null;
  otpExpires: string | null;
  createdAt: string; // ISO date string
  organisations: OrganisationEntry[];
  role: string;
  companyId: number;
  coy_uuid: string;
  organisationId: number;
  org_uuid: string;
  customerId: string;
}

export interface OrganisationEntry {
  role: string;
  companyId: number;
  company: {
    comUUID: string;
    organisation: {
      orgUUID: string;
    };
  };
}

export interface Location {
  id: number;
  location: string;
  organisationId: number;
}

export interface LocationStore {
  locations: Location[] | null;
  setLocation: (val: Location[] | null) => void;
}

export interface Department {
  id: number;
  companyId: number;
  locationId: number;
  departmentId: number;
  department: DepartmentItem;
}

export interface DepartmentItem {
  id: number;
  department: string;
  organisationId: number;
}

export interface DepartmentStore {
  departments: Department[];
  setDepartments: (val: Department[]) => void;
}

export interface AddDevice {
  name: string;
  email: string;
  additionalDetail: string;
  companyLocationDepartmentId: number;
}

interface CompanyLocationDepartment {
  id: number;
  companyId: number;
  locationId: number;
  departmentId: number;
  location: Location;
  department: DepartmentItem;
}

export interface DeviceType {
  id: string; // UUID
  name: string;
  email: string;
  additionalDetail: string;
  companyId: number;
  companyLocationDepartmentId: number;
  createdAt: string; // ISO date string
  createdBy: number;
  downloadLink: boolean;
  companyPlanSubscriptionId?: number;
  status: string;
  expireOn?: string | null; // nullable ISO date string
  isActive?: boolean;
  CompanyLocationDepartment: CompanyLocationDepartment;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SeverityDataItem {
  date: string;
  low: number;
  medium: number;
  high: number;
}

export interface SeverityData {
  data: SeverityDataItem[];
  groupBy: TimeRange;
}

// Define the Plan interface
export interface Product {
  id: number;
  productId: string;
  name: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Plan {
  id: number;
  priceId: string;
  isActive: boolean;
  price: string;
  billingType: 'recurring' | 'one_time'; // add other types if needed
  recurringInterval: 'day' | 'week' | 'month' | 'year'; // adjust if needed
  recurringIntervalCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  defaultDeviceNum: number;
  productId: number;
  Product: Product;
  discountPercentage: number;
}

export interface PlanDetails {
  id: number;
  priceId: string;
  isActive: boolean;
  price: string;
  billingType: 'recurring';
  recurringInterval: string;
  recurringIntervalCount: number;
  createdAt: string;
  updatedAt: string;
  defaultDeviceNum: number;
  productId: number;
  addOnPrice: string;
  Product: Product;
}

export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

export interface Subscription {
  id: number;
  companyId: number;
  planId: number;
  status: SubscriptionStatus;
  deviceNumOverride: number;
  createdAt: Date;
  updateAt: Date;
  expireOn: number;
  invoiceId: string;
  customExpiry: boolean;
  subscriptionId: string;
  subscriptionItemId: string;
}

export interface SubscriptionDetailsType {
  isPremium: boolean;
  planDetails: PlanDetails | null;
  subscription: Subscription | null;
  message: string;
}

export interface PremiumStoreType {
  isPremium: boolean;
  subscription: Subscription | null;
  planDetails: PlanDetails | null;
  setIsPremium: (val: boolean) => void;
  setSubscription: (val: Subscription) => void;
  setPlanDetails: (val: PlanDetails) => void;
}

export interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  created: number;
  invoice_pdf: string;
}

export interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    email: string;
    name: string;
  };
}
