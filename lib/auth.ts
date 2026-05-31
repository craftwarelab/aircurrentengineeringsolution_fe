// In-memory access token storage (RAM only, not persisted)
let accessToken: string | null = null;

export class AuthUtils {
  private static readonly USER_KEY = 'user_data';
  private static readonly LOGGED_IN_KEY = 'is_logged_in';

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

  // Persisted login hint — survives page refresh
  static setLoggedIn(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.LOGGED_IN_KEY, '1');
  }

  static clearLoggedIn(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.LOGGED_IN_KEY);
  }

  static hasLoggedInHint(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.LOGGED_IN_KEY) === '1';
  }

  static isAuthenticated(): boolean {
    return !!accessToken;
  }

  static login(token: string, user: any): void {
    this.setAccessToken(token);
    this.setUser(user);
    this.setLoggedIn();
  }

  static logout(): void {
    this.clearAccessToken();
    this.removeUser();
    this.clearLoggedIn();
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

  // Attempt to refresh the access token using the refresh token cookie.
  // Clears the login hint if refresh fails (fail-safe).
  static async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        this.clearLoggedIn();
        return null;
      }
      const data = await response.json();
      if (data.success && data.data?.access_token) {
        this.setAccessToken(data.data.access_token);
        this.setLoggedIn();
        return data.data.access_token;
      }
      this.clearLoggedIn();
      return null;
    } catch {
      this.clearLoggedIn();
      return null;
    }
  }
}
