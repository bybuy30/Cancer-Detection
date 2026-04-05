import { motion } from "framer-motion";
import { Activity, Target, Microscope } from "lucide-react";
import WireCell from "../../assets/WireCell";

const svgBg = "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h16v2h-6v6h6v8H8v-6H2v6H0V0zm4 4h2v2H4V4zm8 8h2v2h-2v-2zm-8 0h2v2H4v-2zm8-8h2v2h-2V4z' fill='%23b10c0c' fill-opacity='0.58' fill-rule='evenodd'/%3E%3C/svg%3E\")";

const Stage3Detection = ({ diameter = 0, organ = "Lung" }) => {
    const volume = (((4 / 3) * Math.PI * Math.pow(diameter / 2, 3)) / 1000).toFixed(1); // mm -> cm³

    return (
        <section
            className="relative h-screen w-full flex items-center justify-center text-white overflow-hidden"
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

            <div className="relative z-10 flex items-center gap-16">

                <div className="flex items-center justify-center">
                    <WireCell />
                </div>

                <div className="flex flex-col gap-2">

                    <p className="text-[14px] font-bold uppercase tracking-[0.4em] text-white mb-[-10px]">
                        Estimated Tumor Diameter
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-[80px] silkscreen-bold text-red-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.4)] leading-none">
                            {diameter.toFixed(1)}
                        </span>
                        <span className="text-white font-bold text-lg mb-4">MM</span>
                    </div>

                    <p className="text-[14px] font-bold uppercase tracking-[0.4em] text-white mb-[-10px]">
                        Estimated Tumor Volume
                    </p>
                    <div className="flex items-end gap-2">
                        <span className="text-[80px] silkscreen-bold text-red-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.4)] leading-none">
                            {volume}
                        </span>
                        <span className="text-white font-bold text-lg mb-4">CM³</span>
                    </div>

                    {/* STATEMENT */}
                    <p className="text-slate-400 text-xs max-w-sm mt-4 leading-relaxed">
                        Automated AI segmentation detected a suspicious mass in the {organ}.
                        Measurements indicate potentially abnormal growth.
                    </p>

                    <div className="flex gap-6 mt-4 text-red-500 opacity-80">
                        <Activity size={20} />
                        <Microscope size={20} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Stage3Detection;