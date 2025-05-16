// services/apiManager.ts
import {LoginResponse, Response, UserData} from './types';
import {ApiRoutes} from "@/app/api/apiRoutes";

export class APIManager {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    if (!this.baseURL) {
      throw new Error('Rust backend URL is not defined in environment variables');
    }
  }

  // Function to handle login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/${ApiRoutes.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    return await response.json();
  }

  async registerUser(userData: UserData, type: string): Promise<Response> {
    const response = await fetch(`${this.baseURL}/${ApiRoutes.AUTH.REGISTER}/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register user');
    }

    return await response.json();
  }
}

// Create a default instance of APIManager for easy imports
const apiManager = new APIManager();
export default apiManager;
