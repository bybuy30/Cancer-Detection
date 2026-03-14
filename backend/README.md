# Cancer Detection Backend API

This backend provides fake AI model results for the Cancer Detection frontend, simulating real AI analysis based on uploaded image filenames.

## Features

- **Multi-organ Support**: Lung, Prostate, Breast, and Oral cancer detection
- **Filename-based Results**: Returns specific fake results based on image names
- **File Upload**: Handles medical image uploads (DICOM, NIfTI, PNG, JPG)
- **Batch Processing**: Support for multiple file uploads
- **Realistic Simulation**: Includes processing delays and detailed metrics

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API status and timestamp.

### Upload & Analyze
```
POST /api/upload
Content-Type: multipart/form-data
Body: scan (file)
```
Uploads a medical image and returns fake analysis results.

### Get Analysis
```
GET /api/analysis/:filename
```
Retrieves analysis results for a specific filename.

### Supported Organs
```
GET /api/organs
```
Returns list of supported organs and their model accuracies.

### Batch Upload
```
POST /api/batch-upload
Content-Type: multipart/form-data
Body: scans[] (multiple files)
```
Processes multiple files at once.

## Fake Results System

The backend uses filename-based logic to return specific results:

### Specific Results
- `lung_sample_1.png` → High-risk lung tumor (94.2% confidence)
- Add more specific filenames as needed

### Organ Detection
Files are automatically categorized by filename:
- Contains "lung", "chest", "pulmonary" → Lung results
- Contains "prostate" → Prostate results  
- Contains "breast", "mammogram" → Breast results
- Contains "oral", "mouth", "tongue" → Oral results
- Default → Lung results

## Response Format

```json
{
  "success": true,
  "processingTime": 2340,
  "uploadedFile": {
    "originalName": "lung_sample_1.png",
    "filename": "scan-1234567890.png",
    "size": 2048576,
    "url": "/uploads/scan-1234567890.png"
  },
  "analysis": {
    "organ": "lung",
    "tumorDetected": true,
    "confidence": 94.2,
    "diameter": 3.2,
    "volume": 17.8,
    "location": "Right Upper Lobe",
    "pixelCount": 2847,
    "tumorArea": 8.04,
    "coverage": 12.3,
    "severityScore": 7.8,
    "riskLevel": "HIGH",
    "gradCamUrl": "/uploads/gradcam_lung_1.png",
    "segmentationUrl": "/uploads/segmentation_lung_1.png",
    "boundingBox": { "x": 145, "y": 89, "width": 67, "height": 72 },
    "metrics": {
      "diceCoefficient": 0.892,
      "iouScore": 0.804,
      "sensitivity": 0.934,
      "specificity": 0.967
    },
    "processedAt": "2026-03-14T10:30:00.000Z",
    "modelVersion": "AACNN-ViT v2.1"
  }
}
```

## Installation & Setup

```bash
cd backend
npm install
npm run dev
```

The API will run on `http://localhost:5000`

## Adding New Results

To add results for a new image, edit the `fakeResults` object in `server.js`:

```javascript
const fakeResults = {
  'your_image_name.png': {
    organ: 'lung',
    tumorDetected: true,
    confidence: 95.0,
    // ... other properties
  }
};
```

## File Structure

```
backend/
├── server.js          # Main API server
├── package.json       # Dependencies
├── uploads/           # Uploaded files storage
└── README.md          # This file
```