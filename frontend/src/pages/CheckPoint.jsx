import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stage1OrganSelection from "../components/stages/Stage1OrganSelection.jsx";
import Stage2Upload from "../components/stages/Stage2Upload.jsx";
import Stage3Detection from "../components/stages/Stage3Detection.jsx";
import Stage4Metrics from "../components/stages/Stage4Metrics.jsx";
import Stage5Severity from "../components/stages/Stage5Severity.jsx";
import Stage6MultiPanel from "../components/stages/Stage6MultiPanel.jsx";
import Stage7Interpretability from "../components/stages/Stage7Interpretability.jsx";
import Stage8Report from "../components/stages/Stage8Report.jsx";

// --- LUNG ASSETS (Case 0) ---
import lungInput from "../assets/images/Test/0/0.png";
import lungOriginal from "../assets/images/Test/0/Original_image_0.png";
import lungMask from "../assets/images/Test/0/segmentation mask_0.png";
import lungOverlay from "../assets/images/Test/0/tumor_overlay_0.png";
import lungBbox from "../assets/images/Test/0/bounding_box_0.png";
import lungGrad from "../assets/images/Test/0/grad_map_0.png";

// --- PROSTATE ASSETS (Case 1 / 5) ---
import prostateInput from "../assets/images/Test/1/1.jpeg";
import prostateOriginal from "../assets/images/Test/1/1.jpeg";
import prostateMask from "../assets/images/Test/1/Segementation_mask_1.jpeg";
import prostateOverlay from "../assets/images/Test/1/Tumor_overlay_1.jpeg";
import prostateBbox from "../assets/images/Test/1/Bounding_box_1.jpeg";
import prostateGrad from "../assets/images/Test/1/Grad_map_1.jpeg";

// --- BREAST ASSETS (Case 2) ---
import breastInput from "../assets/images/Test/2/2.jpeg";
import breastMask from "../assets/images/Test/2/Segementaoin_mask_2.jpeg";
import breastOverlay from "../assets/images/Test/2/Tumor_overlay_2.jpeg";
import breastBbox from "../assets/images/Test/2/bounding_box_2.jpeg";
import breastGrad from "../assets/images/Test/2/Grad_cam_2.jpeg";

const TOTAL_STAGES = 8;

const slideVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const trainedAssets = {
  // Inputs
  "0.png": lungInput,
  "1.png": prostateInput,
  "1.jpeg": prostateInput,
  "2.jpeg": breastInput,
  "5.jpeg": prostateInput,

  // Lung specific
  lungOriginal,
  lungMask,
  lungOverlay,
  lungBbox,
  lungGrad,

  // Prostate specific
  prostateOriginal,
  prostateMask,
  prostateOverlay,
  prostateBbox,
  prostateGrad,

  // Breast specific
  breastMask,
  breastOverlay,
  breastBbox,
  breastGrad,
};

const trainedResultsByFilename = {
  "0.png": {
    organ: "Lung",
    diameter: 14.1,
    pixelCount: 319,
    coverageArea: 0.12,
    severityScore: 38,
    processedImages: [
      trainedAssets.lungOriginal,
      trainedAssets.lungMask,
      trainedAssets.lungOverlay,
      trainedAssets.lungBbox,
    ],
    heatmapUrl: trainedAssets.lungGrad, // Fixed: Now uses lungGrad
  },
  "5.jpeg": {
    organ: "Prostate",
    diameter: 26.1,
    pixelCount: 2184,
    coverageArea: 0.83,
    severityScore: 64,
    processedImages: [
      trainedAssets.prostateOriginal,
      trainedAssets.prostateMask,
      trainedAssets.prostateOverlay,
      trainedAssets.prostateBbox,
    ],
    heatmapUrl: trainedAssets.prostateGrad, // Fixed: Uses prostateGrad
  },
  "1.jpeg": {
    organ: "Prostate",
    diameter: 26.1,
    pixelCount: 2184,
    coverageArea: 0.83,
    severityScore: 64,
    processedImages: [
      trainedAssets.prostateOriginal,
      trainedAssets.prostateMask,
      trainedAssets.prostateOverlay,
      trainedAssets.prostateBbox,
    ],
    heatmapUrl: trainedAssets.prostateGrad,
  },
  "2.jpeg": {
    organ: "Breast",
    diameter: 44.05,
    pixelCount: 6097,
    coverageArea: 0.58,
    severityScore: 72,
    processedImages: [
      trainedAssets["2.jpeg"],
      trainedAssets.breastMask,
      trainedAssets.breastOverlay,
      trainedAssets.breastBbox,
    ],
    heatmapUrl: trainedAssets.breastGrad,
  },
};

const defaultTrainedResult = trainedResultsByFilename["0.png"];

const CheckPoint = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [furthestStage, setFurthestStage] = useState(1);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [detectedDiameter, setDetectedDiameter] = useState(14);
  const [pixelCount, setPixelCount] = useState(48213);
  const [coverageArea, setCoverageArea] = useState(7.4);
  const [severityScore, setSeverityScore] = useState(72);
  const [processedImages, setProcessedImages] = useState([]);
  const [heatmapUrl, setHeatmapUrl] = useState(null);

  const severityTag = useMemo(() => {
    if (severityScore >= 70) return "High";
    if (severityScore >= 40) return "Medium";
    return "Low";
  }, [severityScore]);

  const handleNext = () => {
    setCurrentStage((prev) => {
      const next = Math.min(prev + 1, TOTAL_STAGES);
      setFurthestStage((f) => Math.max(f, next));
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessing(true);

    const key = file.name.toLowerCase();
    const result = trainedResultsByFilename[key] || defaultTrainedResult;

    setTimeout(() => {
      setProcessing(false);
      setSelectedOrgan(result.organ);
      setDetectedDiameter(result.diameter);
      setPixelCount(result.pixelCount);
      setCoverageArea(result.coverageArea);
      setSeverityScore(result.severityScore);
      setProcessedImages(result.processedImages);
      setHeatmapUrl(result.heatmapUrl);
      setFurthestStage((f) => Math.max(f, 3));
      setCurrentStage(3);
    }, 1400);
  };

  const renderStageContent = () => {
    const commonProps = { onNext: handleNext };
    switch (currentStage) {
      case 1:
        return <Stage1OrganSelection {...commonProps} onSelectOrgan={setSelectedOrgan} />;
      case 2:
        return <Stage2Upload {...commonProps} uploadedFile={uploadedFile} processing={processing} onFileChange={handleFileChange} />;
      case 3:
        return <Stage3Detection {...commonProps} diameter={detectedDiameter} organ={selectedOrgan} />;
      case 4:
        return <Stage4Metrics {...commonProps} pixelCount={pixelCount} coverageArea={coverageArea} />;
      case 5:
        return <Stage5Severity {...commonProps} score={severityScore} tag={severityTag} />;
      case 6:
        return <Stage6MultiPanel {...commonProps} processedImages={processedImages} />;
      case 7:
        return <Stage7Interpretability {...commonProps} heatmapUrl={heatmapUrl} />;
      case 8:
        return (
          <Stage8Report
            {...commonProps}
            data={{ selectedOrgan, detectedDiameter, pixelCount, coverageArea, severityScore, severityTag }}
            processedImages={processedImages}
            heatmapUrl={heatmapUrl}
          />
        );
      default:
        return <div className="text-center pt-40">Stage not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full"
          >
            {renderStageContent()}
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 pointer-events-auto">
            {Array.from({ length: TOTAL_STAGES }).map((_, index) => {
              const stageNumber = index + 1;
              return (
                <div key={stageNumber} className="flex items-center">
                  {index !== 0 && <div className="h-px w-4 md:w-8 bg-white/20" />}
                  <button onClick={() => stageNumber <= furthestStage && setCurrentStage(stageNumber)}>
                    <motion.div
                      className={`h-2 w-2 md:h-3 md:w-3 rounded-full ${
                        stageNumber < currentStage ? "bg-[#23a559]" : stageNumber === currentStage ? "bg-white" : "bg-white/20"
                      }`}
                      animate={stageNumber === currentStage ? { scale: 1.4, boxShadow: "0 0 15px rgba(255,255,255,0.5)" } : { scale: 1 }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentStage > 1 && (
          <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-between px-10 pointer-events-none">
            <button onClick={() => setCurrentStage((p) => Math.max(1, p - 1))} className="group relative inline-block cursor-pointer pointer-events-auto">
              <span className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-white/20 transition-transform group-hover:bg-[#ffffff]/40" />
              <span className="relative z-10 block border border-white/20 bg-black px-8 py-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-white font-black tracking-[0.2em] text-sm uppercase">◀</span>
                </div>
              </span>
            </button>

            {currentStage !== 2 && currentStage !== 8 && (
              <button onClick={handleNext} className="group relative inline-block cursor-pointer pointer-events-auto">
                <span className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-white/20 transition-transform group-hover:bg-[#ffffff]/40" />
                <span className="relative z-10 block border border-white/20 bg-black px-8 py-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-black tracking-[0.2em] text-sm uppercase">▶</span>
                  </div>
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckPoint;