import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Scan, Box, ChevronLeft, Crosshair, Zap, Layers } from "lucide-react";

const svgBg = "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h16v2h-6v6h6v8H8v-6H2v6H0V0zm4 4h2v2H4V4zm8 8h2v2h-2v-2zm-8 0h2v2H4v-2zm8-8h2v2h-2V4z' fill='%23b10c0c' fill-opacity='0.58' fill-rule='evenodd'/%3E%3C/svg%3E\")";

const Stage6MultiPanel = ({ processedImages = [] }) => {
    const [selectedView, setSelectedView] = useState(null);

    const panels = [
        { id: 0, label: 'Original Scan', icon: <Layers size={14} />, symbol: "AX-01" },
        { id: 1, label: 'segmentation mask', icon: <Scan size={14} />, symbol: "SG-02" },
        { id: 2, label: 'Tumor Overlay', icon: <Crosshair size={14} />, symbol: "CR-03" },
        { id: 3, label: 'Bounding Box', icon: <Box size={14} />, symbol: "3D-VX" }
    ];

    return (
        <section
            className="relative h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden"
            style={{
                backgroundColor: "#000",
                backgroundImage: svgBg,
                backgroundSize: "12px",
                backgroundRepeat: "repeat",
            }}
        >
            <div className="absolute top-8 left-8 z-20 flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.4em] text-red-400 font-bold">Checkpoint</p>
                <p className="text-lg font-black uppercase tracking-widest">Medical <span className="text-red-400">AI</span></p>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_95%)]" />

            <div className="absolute top relative z-10 mb-6 text-center">
                <h2 className="text-3xl font-black uppercase tracking-[0.2em] silkscreen-bold">
                    Multi-Panel <span className="text-red-500">Visualization</span>
                </h2>
            </div>

            <div className="relative z-10 w-full max-w-[94vw] h-[72vh] grid grid-cols-2 gap-4">
                {panels.map((panel, index) => (
                    <motion.div
                        key={panel.id}
                        layoutId={`panel-${panel.id}`}
                        onClick={() => setSelectedView(panel)}
                        className="group relative cursor-zoom-in bg-black/60 border border-red-900/30 flex flex-col items-center justify-center overflow-hidden hover:border-red-500/50 transition-colors"
                    >
                        {processedImages[index] ? (
                            <img src={processedImages[index]} className="absolute inset-0 w-full h-full object-cover opacity-70" alt={panel.label} />
                        ) : (
                            <div className="opacity-20 flex flex-col items-center gap-4">
                                <LayoutGrid size={40} className="text-red-600" />
                                <span className="text-[10px] uppercase tracking-widest">Awaiting Feed...</span>
                            </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="text-red-500">{panel.icon}</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">{panel.label}</span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                            <span className="text-[9px] font-mono text-red-900 font-bold tracking-tighter">{panel.symbol}</span>
                        </div>
                        
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(220,38,38,0.02)_50%,transparent_100%)] h-1/2 w-full animate-[scan_5s_linear_infinite]" />
                    </motion.div>
                ))}
            </div>

            {/* Full Screen Overlay */}
            <AnimatePresence>
                {selectedView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8"
                    >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: svgBg, backgroundSize: "12px" }} />
                        
                        {/* Header for Full Screen */}
                        <div className="absolute top-8 left-12 right-12 flex justify-between items-center">
                            <button 
                                onClick={() => setSelectedView(null)}
                                className="flex items-center gap-2 text-red-500 hover:text-white transition-colors group"
                            >
                                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest">Back to Grid</span>
                            </button>
                            <div className="text-right">
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Anatomical Focus</p>
                                <p className="text-xl font-black uppercase tracking-widest silkscreen-bold">{selectedView.label}</p>
                            </div>
                        </div>

                        {/* Main Full View Image Area */}
                        <motion.div 
                            layoutId={`panel-${selectedView.id}`}
                            className="w-full h-full max-w-6xl max-h-[80vh] border border-red-500/30 bg-black/80 relative flex items-center justify-center overflow-hidden"
                        >
                            {processedImages[selectedView.id] ? (
                                <img src={processedImages[selectedView.id]} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-red-900/50 silkscreen-bold text-4xl uppercase opacity-20">No Volumetric Data</div>
                            )}
                            
                            {/* HUD Overlays */}
                            <div className="absolute inset-0 border-[40px] border-transparent pointer-events-none">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Stage6MultiPanel;