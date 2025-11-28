import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import { NetworkNode } from './components/NetworkNode';
import { Packet } from './components/Packet';
import { Connections } from './components/Connections';
import { NETWORK_NODES, STEPS } from './constants';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  // Auto-advance logic
  const handleStepComplete = useCallback(() => {
    if (autoPlay) {
        if (currentStepIndex < STEPS.length - 1) {
            // Small delay before next step for readability
            setTimeout(() => {
                setCurrentStepIndex(prev => prev + 1);
            }, 500);
        } else {
            // End of sequence
            setIsPlaying(false);
            setAutoPlay(false);
        }
    } else {
        setIsPlaying(false);
    }
  }, [autoPlay, currentStepIndex]);

  const handlePlayPause = () => {
    if (currentStepIndex === STEPS.length - 1 && !isPlaying) {
        // Restart if at end
        setCurrentStepIndex(0);
        setIsPlaying(true);
        setAutoPlay(true);
    } else {
        setIsPlaying(!isPlaying);
        setAutoPlay(!isPlaying); 
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setIsPlaying(true); // Start animation for new step
        setAutoPlay(false); // Manual step disables auto-sequence
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
        setIsPlaying(true);
        setAutoPlay(false);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setAutoPlay(false);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 10, 18]} fov={50} />
            <OrbitControls 
                enablePan={true} 
                maxPolarAngle={Math.PI / 2.1} 
                minDistance={5} 
                maxDistance={35}
                target={[0, 0, 0]}
            />
            
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="#06b6d4" />
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" />

            {/* Floor Grid */}
            <gridHelper args={[40, 40, 0x1e293b, 0x0f172a]} position={[0, -0.01, 0]} />

            <group>
                <Connections />
                {NETWORK_NODES.map((node) => (
                    <NetworkNode 
                        key={node.id} 
                        {...node} 
                        type={node.id}
                        label={node.label || node.id} // Use custom label if available
                        isHighlighted={currentStep.highlightNodes.includes(node.id)}
                    />
                ))}
                
                {/* The Animated Packet */}
                <Packet 
                    path={currentStep.path}
                    visible={currentStep.isPacketVisible}
                    color={currentStep.packetColor || "#ffffff"}
                    speed={1.2} // Decreased speed from 2.5 for better visibility
                    isPlaying={isPlaying}
                    onComplete={handleStepComplete}
                    label={currentStep.packetLabel}
                />
            </group>
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-sm">
                    SecFlow 3D
                </h1>
                <p className="text-slate-400 text-sm mt-1">Enterprise Network Request Lifecycle</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-700 max-w-sm">
               <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <ShieldCheck size={18} />
                  <span className="font-bold text-sm">Security Context</span>
               </div>
               <p className="text-xs text-slate-300 leading-relaxed">
                 {currentStep.description}
               </p>
            </div>
        </div>

        {/* Timeline Sidebar (Right) */}
        <div className="absolute right-6 top-24 bottom-24 w-64 overflow-y-auto pr-2 pointer-events-auto scrollbar-hide">
            <div className="flex flex-col gap-2">
                {STEPS.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isPast = idx < currentStepIndex;
                    return (
                        <div 
                            key={step.id}
                            onClick={() => {
                                setCurrentStepIndex(idx);
                                setIsPlaying(true);
                                setAutoPlay(false);
                            }} 
                            className={`p-3 rounded-md border cursor-pointer transition-all duration-300 transform
                                ${isActive 
                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] translate-x-[-5px]' 
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                                }
                                ${isPast ? 'opacity-50' : 'opacity-100'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                                <span className={`text-xs font-semibold ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Playback Controls (Bottom Center) */}
        <div className="w-full flex justify-center pointer-events-auto mb-4">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
                <button onClick={handleReset} className="text-slate-400 hover:text-white transition-colors" title="Restart">
                    <RotateCcw size={20} />
                </button>
                <button onClick={handlePrev} className="text-slate-300 hover:text-white transition-colors" title="Previous Step">
                    <SkipBack size={24} />
                </button>
                
                <button 
                    onClick={handlePlayPause}
                    className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                    {isPlaying && autoPlay ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button onClick={handleNext} className="text-slate-300 hover:text-white transition-colors" title="Next Step">
                    <SkipForward size={24} />
                </button>
            </div>
        </div>

        {/* Legend (Bottom Left) */}
        <div className="absolute bottom-6 left-6 pointer-events-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur text-xs text-slate-400">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-sm opacity-80"></div> Firewall
             </div>
             <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-amber-500 rounded-sm opacity-80"></div> Load Balancer
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm opacity-80"></div> App Server
             </div>
        </div>

      </div>
    </div>
  );
}