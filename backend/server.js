import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|dcm|nii|gz/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only medical image files are allowed!'));
    }
  }
});

// Fake results database based on image names
const fakeResults = {
  // You'll provide the actual results for these images
  'lung_sample_1.png': {
    organ: 'lung',
    tumorDetected: true,
    confidence: 94.2,
    diameter: 3.2,
    volume: 17.8,
    location: 'Right Upper Lobe',
    pixelCount: 2847,
    tumorArea: 8.04,
    coverage: 12.3,
    severityScore: 7.8,
    riskLevel: 'HIGH',
    gradCamUrl: '/uploads/gradcam_lung_1.png',
    segmentationUrl: '/uploads/segmentation_lung_1.png',
    boundingBox: { x: 145, y: 89, width: 67, height: 72 },
    metrics: {
      diceCoefficient: 0.892,
      iouScore: 0.804,
      sensitivity: 0.934,
      specificity: 0.967
    }
  },
  
  // Default lung result template
  'default_lung': {
    organ: 'lung',
    tumorDetected: true,
    confidence: 89.5,
    diameter: 2.8,
    volume: 11.5,
    location: 'Left Lower Lobe',
    pixelCount: 2156,
    tumorArea: 6.15,
    coverage: 9.7,
    severityScore: 6.4,
    riskLevel: 'MODERATE',
    gradCamUrl: '/uploads/gradcam_default.png',
    segmentationUrl: '/uploads/segmentation_default.png',
    boundingBox: { x: 120, y: 95, width: 58, height: 63 },
    metrics: {
      diceCoefficient: 0.856,
      iouScore: 0.748,
      sensitivity: 0.891,
      specificity: 0.943
    }
  },

  // Prostate template
  'default_prostate': {
    organ: 'prostate',
    tumorDetected: true,
    confidence: 91.7,
    diameter: 1.9,
    volume: 3.6,
    location: 'Peripheral Zone',
    pixelCount: 1834,
    tumorArea: 2.84,
    coverage: 15.2,
    severityScore: 5.8,
    riskLevel: 'MODERATE',
    gradCamUrl: '/uploads/gradcam_prostate.png',
    segmentationUrl: '/uploads/segmentation_prostate.png',
    boundingBox: { x: 98, y: 112, width: 45, height: 48 },
    metrics: {
      diceCoefficient: 0.823,
      iouScore: 0.701,
      sensitivity: 0.876,
      specificity: 0.921
    }
  },

  // Breast template  
  'default_breast': {
    organ: 'breast',
    tumorDetected: true,
    confidence: 87.3,
    diameter: 2.1,
    volume: 4.9,
    location: 'Upper Outer Quadrant',
    pixelCount: 1967,
    tumorArea: 3.46,
    coverage: 8.9,
    severityScore: 6.1,
    riskLevel: 'MODERATE',
    gradCamUrl: '/uploads/gradcam_breast.png',
    segmentationUrl: '/uploads/segmentation_breast.png',
    boundingBox: { x: 134, y: 76, width: 52, height: 55 },
    metrics: {
      diceCoefficient: 0.798,
      iouScore: 0.664,
      sensitivity: 0.845,
      specificity: 0.912
    }
  },

  // Oral template
  'default_oral': {
    organ: 'oral',
    tumorDetected: true,
    confidence: 93.1,
    diameter: 1.6,
    volume: 2.1,
    location: 'Tongue Base',
    pixelCount: 1456,
    tumorArea: 2.01,
    coverage: 11.4,
    severityScore: 7.2,
    riskLevel: 'HIGH',
    gradCamUrl: '/uploads/gradcam_oral.png',
    segmentationUrl: '/uploads/segmentation_oral.png',
    boundingBox: { x: 156, y: 89, width: 38, height: 42 },
    metrics: {
      diceCoefficient: 0.867,
      iouScore: 0.765,
      sensitivity: 0.923,
      specificity: 0.956
    }
  }
};

// Helper function to determine organ type from filename
function detectOrganType(filename) {
  const name = filename.toLowerCase();
  if (name.includes('lung') || name.includes('chest') || name.includes('pulmonary')) {
    return 'lung';
  } else if (name.includes('prostate')) {
    return 'prostate';
  } else if (name.includes('breast') || name.includes('mammogram')) {
    return 'breast';
  } else if (name.includes('oral') || name.includes('mouth') || name.includes('tongue')) {
    return 'oral';
  }
  return 'lung'; // Default to lung
}

// Helper function to get fake results
function getFakeResults(originalFilename) {
  // Check if we have specific results for this filename
  if (fakeResults[originalFilename]) {
    return fakeResults[originalFilename];
  }
  
  // Otherwise, use organ-specific default
  const organ = detectOrganType(originalFilename);
  return fakeResults[`default_${organ}`];
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cancer Detection API is running',
    timestamp: new Date().toISOString()
  });
});

// Upload and analyze endpoint
app.post('/api/upload', upload.single('scan'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, path: filePath, size } = req.file;
    
    console.log(`Processing file: ${originalname}`);
    
    // Simulate processing delay (1-3 seconds)
    const processingTime = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Get fake results based on filename
    const results = getFakeResults(originalname);
    
    // Add processing metadata
    const response = {
      success: true,
      processingTime: Math.round(processingTime),
      uploadedFile: {
        originalName: originalname,
        filename: filename,
        size: size,
        url: `/uploads/${filename}`
      },
      analysis: {
        ...results,
        processedAt: new Date().toISOString(),
        modelVersion: 'AACNN-ViT v2.1',
        processingTimeMs: Math.round(processingTime)
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Processing failed', 
      message: error.message 
    });
  }
});

// Get analysis results by filename
app.get('/api/analysis/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const results = getFakeResults(filename);
    
    if (!results) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    res.json({
      success: true,
      analysis: {
        ...results,
        processedAt: new Date().toISOString(),
        modelVersion: 'AACNN-ViT v2.1'
      }
    });
    
  } catch (error) {
    console.error('Analysis retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve analysis', 
      message: error.message 
    });
  }
});

// Get supported organs
app.get('/api/organs', (req, res) => {
  res.json({
    success: true,
    organs: [
      {
        id: 'lung',
        name: 'Lung',
        description: 'Lung cancer detection from CT scans',
        modelAccuracy: 96.8,
        supportedFormats: ['DICOM', 'NIfTI', 'PNG', 'JPG']
      },
      {
        id: 'prostate',
        name: 'Prostate',
        description: 'Prostate cancer detection from MRI scans',
        modelAccuracy: 94.2,
        supportedFormats: ['DICOM', 'NIfTI', 'PNG', 'JPG']
      },
      {
        id: 'breast',
        name: 'Breast',
        description: 'Breast cancer detection from mammograms',
        modelAccuracy: 92.5,
        supportedFormats: ['DICOM', 'PNG', 'JPG']
      },
      {
        id: 'oral',
        name: 'Oral',
        description: 'Oral cancer detection from CT/MRI scans',
        modelAccuracy: 95.1,
        supportedFormats: ['DICOM', 'NIfTI', 'PNG', 'JPG']
      }
    ]
  });
});

// Batch analysis endpoint
app.post('/api/batch-upload', upload.array('scans', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];
    
    for (const file of req.files) {
      const { originalname, filename, size } = file;
      
      // Simulate processing delay
      const processingTime = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      const analysis = getFakeResults(originalname);
      
      results.push({
        originalName: originalname,
        filename: filename,
        size: size,
        url: `/uploads/${filename}`,
        analysis: {
          ...analysis,
          processedAt: new Date().toISOString(),
          processingTimeMs: Math.round(processingTime)
        }
      });
    }
    
    res.json({
      success: true,
      totalFiles: req.files.length,
      results: results
    });
    
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({ 
      error: 'Batch processing failed', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cancer Detection API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`🔬 Supported organs: http://localhost:${PORT}/api/organs`);
});

export default app;