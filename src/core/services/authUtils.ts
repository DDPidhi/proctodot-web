export interface User {
  id: number;
  email: string;
  type: string;
  firstName?: string;
  lastName?: string;
}

export const authUtils = {
  setAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  },

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authToken');
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  },

  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
    }
  }
};