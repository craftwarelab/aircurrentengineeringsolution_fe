# Axios & SWR Setup

This project uses Axios for HTTP requests and SWR for data fetching with professional configuration including authentication handling and global state management.

## Installation

First, install the required packages:

```bash
npm install axios swr
```

## Features

### 🚀 Axios Configuration
- **Professional axios instance** with interceptors
- **Automatic auth header injection** (Bearer tokens)
- **Unauthorized response handling** with automatic logout
- **Token expiration detection**
- **Server-side rendering support**

### 🔄 SWR Global Configuration
- **Global SWR provider** with optimized settings
- **Custom fetcher** using axios instance
- **Error handling and retry logic**
- **Loading states and deduping**

### 🔐 Authentication System
- **AuthUtils class** for token and user management
- **Automatic token refresh detection**
- **Secure logout with cleanup**

## Usage

### Basic API Calls

```typescript
import api from '@/lib/api';

// GET request
const response = await api.get('/users');

// POST request
const newUser = await api.post('/users', { name: 'John' });
```

### Using SWR Hooks

```typescript
import { useApiGet, useApiPost } from '@/lib/hooks/use-api';

function UserList() {
  const { data, error, isLoading } = useApiGet('/users');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

function CreateUser() {
  const { trigger, isMutating } = useApiPost('/users');

  const handleSubmit = async (userData) => {
    try {
      await trigger(userData);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    <button onClick={() => handleSubmit({ name: 'New User' })} disabled={isMutating}>
      Create User
    </button>
  );
}
```

### Authentication

```typescript
import { AuthUtils } from '@/lib/auth';
import { useLogin, useAuthUser } from '@/lib/hooks/use-api';

// Login
function LoginForm() {
  const { trigger } = useLogin();

  const handleLogin = async (credentials) => {
    const result = await trigger(credentials);
    AuthUtils.login(result.token, result.user);
  };
}

// Check auth status
function ProtectedComponent() {
  const { data: user, error } = useAuthUser();

  if (error?.response?.status === 401) {
    return <div>Please log in</div>;
  }

  return <div>Welcome {user?.name}</div>;
}

// Logout
function LogoutButton() {
  const handleLogout = () => {
    AuthUtils.logout();
    window.location.href = '/admin/login';
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Customizing SWR Config

Edit `lib/swr-config.ts` to customize SWR behavior:

```typescript
export const swrConfig = {
  revalidateOnFocus: false,
  refreshInterval: 300000, // 5 minutes
  // ... other options
};
```

## File Structure

```
lib/
├── api.ts              # Axios instance with interceptors
├── auth.ts             # Authentication utilities
├── swr-config.ts       # SWR global configuration
└── hooks/
    └── use-api.ts      # Reusable API hooks

components/providers/
└── swr-provider.tsx    # SWR provider component
```

## Error Handling

The setup includes comprehensive error handling:

- **401 responses**: Automatic logout and redirect
- **403 responses**: Token expiration handling
- **5xx responses**: Logged to console
- **Network errors**: Retried with exponential backoff (via SWR)

## Security Notes

- Tokens are stored in localStorage (client-side only)
- Automatic token expiration checking
- Secure logout with complete cleanup
- Authorization headers automatically injected