import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeType } from '../types';
import { getPos } from '../constants';

interface PacketProps {
  path: NodeType[];
  visible: boolean;
  color: string;
  speed: number;
  isPlaying: boolean;
  onComplete: () => void;
  label?: string;
}

export const Packet: React.FC<PacketProps> = ({ path, visible, color, speed, isPlaying, onComplete, label }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  
  // Use a ref for progress to avoid re-rendering the component 60fps
  const progressRef = useRef(0);

  // Reset progress when the path changes (new step)
  useEffect(() => {
    progressRef.current = 0;
  }, [path]);

  useFrame((state, delta) => {
    // IMPORTANT: Do NOT check !visible here. 
    // We want the logic/timer to run even if the packet is hidden so the step completes.
    if (!meshRef.current || !isPlaying) return;

    if (path.length < 2) return;

    // Calculate max progress index
    const maxProgress = path.length - 1;

    // Move only if not already finished
    if (progressRef.current < maxProgress) {
        const nextProgress = progressRef.current + (delta * speed);
        
        if (nextProgress >= maxProgress) {
            progressRef.current = maxProgress;
            onComplete(); // Notify parent
        } else {
            progressRef.current = nextProgress;
        }
    }

    // Determine position based on progressRef
    const currentIndex = Math.floor(progressRef.current);
    const nextIndex = Math.min(currentIndex + 1, path.length - 1);
    const segmentProgress = progressRef.current - currentIndex; // 0 to 1 within segment

    const startPos = new THREE.Vector3(...getPos(path[currentIndex]));
    const endPos = new THREE.Vector3(...getPos(path[nextIndex]));

    // Add height offset
    startPos.y += 0.5;
    endPos.y += 0.5;

    // Update Mesh Position directly
    meshRef.current.position.copy(startPos.lerp(endPos, segmentProgress));
    
    // Scale pulse
    const scale = 0.2 + Math.sin(state.clock.elapsedTime * 15) * 0.05;
    meshRef.current.scale.setScalar(scale);

    // Trail effect
    if (trailRef.current) {
        trailRef.current.position.copy(meshRef.current.position);
        trailRef.current.position.y -= 0.05;
        trailRef.current.scale.set(scale * 2, 0.05, scale * 2);
    }
  });

  // Render logic: we render the mesh even if !visible so the ref exists and useFrame runs.
  // We control visibility via the Three.js visible prop.
  return (
    <>
      <mesh ref={meshRef} visible={visible}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={2} 
            toneMapped={false} 
        />
        <pointLight color={color} intensity={2} distance={3} decay={2} />
        
        {/* Packet Label - Only show if visible */}
        {visible && label && (
           <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]}>
             <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap backdrop-blur-sm">
                {label}
             </div>
           </Html>
        )}
      </mesh>
      
      {/* Simple glow trail */}
      {visible && (
        <mesh ref={trailRef} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.1, 0.3, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
    </>
  );
};