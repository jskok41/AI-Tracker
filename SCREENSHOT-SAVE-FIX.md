# Screenshot Save Fix

## Problem
Screenshots were being uploaded successfully to Vercel Blob Storage and saved to the database, but the UI was not reflecting the changes after upload. The user would see "Screenshot uploaded successfully" but the image would disappear or not persist after a page refresh.

## Root Cause
The issue was in the data flow between the client and server components:

1. **Server Component** (`projects/page.tsx`): Fetches project data including `screenshotUrl` from the database
2. **Client Component** (`expandable-project-list.tsx`): Receives projects as props and passes `screenshotUrl` to `ProjectScreenshotUpload`
3. **Upload Component** (`project-screenshot-upload.tsx`): Uploads screenshot and updates its local state, but the parent component doesn't know about the change

The problem: When the screenshot was uploaded, only the upload component's local state was updated. The parent component still had the old `screenshotUrl` prop from the initial server-side render. Without refreshing the data, the UI showed stale information.

## Solution
Added a data refresh mechanism using Next.js App Router's `router.refresh()`:

### Changes Made

1. **Added `useRouter` hook to `expandable-project-list.tsx`**:
   ```typescript
   import { useRouter } from 'next/navigation';
   
   const router = useRouter();
   ```

2. **Created a handler function to refresh data**:
   ```typescript
   const handleScreenshotUpdate = () => {
     // Refresh the page to get updated data from the server
     router.refresh();
   };
   ```

3. **Passed the handler to `ProjectScreenshotUpload`**:
   ```typescript
   <ProjectScreenshotUpload
     projectId={project.id}
     currentScreenshotUrl={project.screenshotUrl}
     onUploadComplete={handleScreenshotUpdate}  // <-- Added this
   />
   ```

4. **The upload component already calls `onUploadComplete`**:
   - After successful upload (line 75)
   - After successful deletion (line 111)

## How It Works Now

1. User uploads a screenshot
2. Image is saved to Vercel Blob Storage
3. Database is updated with the new `screenshotUrl`
4. `onUploadComplete` callback is triggered
5. `router.refresh()` re-fetches data from the server
6. Parent component receives updated `screenshotUrl`
7. UI displays the persisted screenshot

## Testing Steps

1. Navigate to Projects page
2. Expand a project
3. Upload a screenshot
4. Verify the screenshot appears immediately
5. Refresh the browser page
6. Verify the screenshot persists

## Files Modified

- `ai-benefits-tracker/components/dashboard/expandable-project-list.tsx`
  - Added `useRouter` import
  - Added `handleScreenshotUpdate` function
  - Passed `onUploadComplete` prop to `ProjectScreenshotUpload`

## Notes

- The API endpoints (`/api/projects/upload-screenshot` and `/api/projects/[id]/screenshot`) were already working correctly
- The upload component (`ProjectScreenshotUpload`) was already calling `onUploadComplete`
- The only missing piece was triggering a data refresh in the parent component
- This pattern follows Next.js App Router best practices for updating server-rendered data from client components
