// In-memory access token storage (RAM only, not persisted)
let accessToken: string | null = null;

export class AuthUtils {
  private static readonly USER_KEY = 'user_data';

  static getAccessToken(): string | null {
    return accessToken;
  }

  static setAccessToken(token: string): void {
    accessToken = token;
  }

  static clearAccessToken(): void {
    accessToken = null;
  }

  static getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userData = sessionStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user: any): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static removeUser(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!accessToken;
  }

  static login(token: string, user: any): void {
    this.setAccessToken(token);
    this.setUser(user);
  }

  static logout(): void {
    this.clearAccessToken();
    this.removeUser();
  }

  static updateUser(userData: any): void {
    const currentUser = this.getUser();
    if (currentUser) {
      this.setUser({ ...currentUser, ...userData });
    }
  }

  static isTokenExpired(): boolean {
    if (!accessToken) return true;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  // Attempt to refresh the access token using the refresh token cookie
  static async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.success && data.data?.access_token) {
        this.setAccessToken(data.data.access_token);
        return data.data.access_token;
      }
      return null;
    } catch {
      return null;
    }
  }
}
