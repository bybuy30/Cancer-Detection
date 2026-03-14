# Frontend Integration Guide

To connect the frontend to this backend API, you'll need to make these changes:

## 1. Update StageInput.jsx

Replace the file upload handler to send files to the backend:

```javascript
const handleFileUpload = async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setUploadedFile(file);
    
    // Upload to backend
    const formData = new FormData();
    formData.append('scan', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store the analysis results
        setScanData(result.analysis);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
};
```

## 2. Update StageSegmentation.jsx

Remove the mock scanning and use real data:

```javascript
const startScan = () => {
  setIsScanning(true);
  
  // Use the real scan data from backend
  setTimeout(() => {
    setIsScanning(false);
    // scanData is already set from the upload
  }, 3500);
};
```

## 3. Update StageMetrics.jsx

Use real metrics from the backend:

```javascript
const metrics = [
  {
    title: 'Tumor Confidence',
    value: scanData?.confidence?.toString() || '0',
    suffix: '%',
    icon: '🎯',
    size: 'large',
  },
  {
    title: 'Tumor Diameter',
    value: scanData?.diameter?.toString() || '0',
    suffix: 'cm',
    icon: '📏',
    size: 'medium',
  },
  // ... use scanData for all metrics
];
```

## 4. Add API Configuration

Create `frontend/src/config/api.js`:

```javascript
export const API_BASE_URL = 'http://localhost:5000/api';

export const uploadScan = async (file) => {
  const formData = new FormData();
  formData.append('scan', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

export const getAnalysis = async (filename) => {
  const response = await fetch(`${API_BASE_URL}/analysis/${filename}`);
  return response.json();
};

export const getSupportedOrgans = async () => {
  const response = await fetch(`${API_BASE_URL}/organs`);
  return response.json();
};
```

## 5. Environment Variables

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## 6. CORS Setup

The backend already includes CORS middleware, so cross-origin requests from the frontend will work.

## Testing the Integration

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Upload a file named `lung_sample_1.png` to see the specific fake results
4. Upload any other file to see organ-specific default results

## Image Naming Convention

To get specific results, name your test images:
- `lung_sample_1.png` → Specific lung results
- `prostate_test.png` → Default prostate results
- `breast_scan.jpg` → Default breast results
- `oral_ct.png` → Default oral results
- `random_name.png` → Default lung results