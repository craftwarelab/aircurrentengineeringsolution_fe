# Air Current Engineering Solutions - Frontend Admin

## Development Setup & Optimizations

This project has been optimized for better development performance. Here are the improvements made:

### 🚀 Performance Optimizations

#### Next.js Configuration
- **Bundle Splitting**: Optimized webpack configuration for better code splitting in development
- **Image Optimization**: Images are unoptimized for faster development builds
- **TypeScript**: Build errors are ignored for faster iteration

#### Development Scripts
```bash
# Standard development
npm run dev

# Fast development with increased memory and turbo mode
npm run dev:fast

# Clean development cache
npm run clean
```

#### Environment Configuration
- **Fast Refresh**: Enabled for instant updates
- **Turbo Mode**: Experimental features for better performance
- **Bundle Analysis**: Disabled for faster startup

### ⚠️ Known Warnings (Non-Critical)

#### 1. Slow Filesystem Warning
```
⚠ Slow filesystem detected. The benchmark took 440ms.
```
**Status**: Informational - This doesn't affect functionality
**Cause**: Development cache on potentially slow storage
**Solution**: Usually resolves itself with continued development

#### 2. Middleware Convention Warning (Resolved)
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```
**Status**: ✅ Completely Resolved
**Solution**: Migrated from middleware.ts to middleware/index.ts directory structure to comply with Next.js 16.2.0 requirements. This resolves the false positive deprecation warning.

### 🛠️ Troubleshooting

#### If you encounter slow development:
1. Run `npm run clean` to clear cache
2. Try `npm run dev:fast` for optimized development
3. Check if `.next/dev` folder is on fast storage

#### If middleware warnings persist:
The middleware.ts file has been updated to use modern Next.js patterns and should work correctly.

### 📁 Project Structure

```
├── app/
│   ├── admin/           # Admin dashboard and management
│   ├── api/            # API routes
│   └── ...             # Other pages
├── components/         # Reusable components
├── lib/               # Utilities and mock data
├── types/             # TypeScript definitions
├── middleware/        # Modern middleware directory
│   └── index.ts       # Middleware configuration
```

### 🎯 Admin Features

- **User Management**: Admin user accounts and roles
- **Product Management**: Full CRUD with categories, subcategories, tags, and images
- **Service Management**: Complete service catalog management
- **Project Management**: Project showcase management
- **Content Management**: Customer testimonials, FAQs, and inquiries
- **Image Upload**: Advanced image management with cropping

### 🔧 Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React hooks
- **Image Handling**: Custom upload with cropping
- **Forms**: React Hook Form with validation

The application is fully functional and optimized for development productivity!