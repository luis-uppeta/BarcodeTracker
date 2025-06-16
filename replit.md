# Barcode Scanner Web Application

## Overview
A mobile-first barcode scanner web application designed for efficient UID validation and tracking across multiple sandbox environments. The application provides real-time barcode scanning, manual UID input, and comprehensive scan history tracking.

## Project Architecture

### Core Features
- Native browser camera integration with automatic startup
- Real-time barcode decoding using ZXing library
- UID validation (English letter + 4 digits format)
- Multiple sandbox environment support (8 sandboxes)
- Scan history with relative timestamps
- Settings management with localStorage persistence

### Technology Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with in-memory storage
- **Barcode Scanning**: ZXing (@zxing/library)
- **Build Tool**: Vite

### Routing Structure
- `/` - Home page with sandbox selection
- `/checkin/:sandboxname` - Individual sandbox checkin pages (8 routes)
- `/settings` - Settings page for default sandbox selection

### Sandbox Environments
1. VigenAiR (vigenair)
2. VideoMate (videomate) 
3. FeedGen (feedgen)
4. Advatars (advatars)
5. Sandbox 5 (sandbox5)
6. Sandbox 6 (sandbox6)
7. Sandbox 7 (sandbox7)
8. Sandbox 8 (sandbox8)

## Recent Changes (2025-01-16)

### Major Architectural Updates
- **Removed multilingual support**: Simplified application to single language (Chinese)
- **Relocated sandbox selection**: Moved from main interface to dedicated settings page
- **Implemented routing-based sandbox access**: Added 8 individual `/checkin/:sandboxname` routes
- **Automatic camera startup**: Camera now starts automatically on page load instead of manual activation
- **Redesigned UI controls**: Replaced large buttons with small circular dot controls for cleaner interface
- **Added PostgreSQL database**: Implemented IP address and device information recording
- **Enhanced scan history filtering**: Added personal vs sandbox-wide filtering with mobile-optimized UI
- **Improved mobile interface**: Reduced card heights, simplified filter buttons, always show sandbox labels
- **Collapsible scan history**: Default to showing only 3 most recent records with expand/collapse functionality
- **Simplified navigation**: Removed back button from checkin pages for cleaner interface
- **Improved settings navigation**: Settings page back button now returns to previous page instead of homepage

### File Structure Changes
- `client/src/pages/scanner.tsx` - Converted to home page with sandbox selection
- `client/src/pages/checkin.tsx` - New dedicated checkin page for each sandbox
- `client/src/pages/settings.tsx` - New settings page for configuration
- `client/src/lib/utils.ts` - Updated sandbox definitions and removed language functions
- `client/src/components/barcode-scanner.tsx` - Enhanced with automatic camera startup and dot controls

### User Interface Improvements
- Automatic camera permission handling with fallback manual controls
- Small circular buttons (dots) for start/stop camera controls
- Cleaner card-based interface for sandbox selection
- Responsive design optimized for mobile devices
- Error handling with informative user feedback

## User Preferences
- Prefers Chinese language interface
- Wants minimal UI elements with hidden controls
- Prefers automatic functionality over manual interactions
- Values clean, mobile-first design

## Current State
- All 8 sandbox routes are functional
- Camera automatically starts on checkin pages
- Settings page allows default sandbox configuration
- Scan history tracking works across all sandboxes
- UI uses small dot controls instead of large buttons

## Data Storage
- In-memory storage for development (MemStorage)
- Scan records with timestamps and sandbox association
- localStorage for user preferences (selected sandbox)