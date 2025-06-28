// Define the Plan interface
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  organizations: number;
}

// Define input types for creating and updating plans
export interface CreatePlanInput {
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  organizations?: number;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  id: number;
}

// API base URL - should be set in your environment variables
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

// Get all plans
export async function getPlans(): Promise<Plan[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return handleResponse<Plan[]>(response);
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

// Get a plan by ID
export async function getPlan(id: number): Promise<Plan> {
  try {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return handleResponse<Plan>(response);
  } catch (error) {
    console.error(`Error fetching plan with ID ${id}:`, error);
    throw error;
  }
}
