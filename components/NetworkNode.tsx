import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeType } from '../types';

interface NetworkNodeProps {
  type: NodeType;
  position: [number, number, number];
  color: string;
  isHighlighted: boolean;
  label: string;
}

export const NetworkNode: React.FC<NetworkNodeProps> = ({ type, position, color, isHighlighted, label }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Idle float animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.5;
    }
    if (glowRef.current) {
        glowRef.current.position.y = position[1] + 0.5;
        if (isHighlighted) {
            glowRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4;
        } else {
            glowRef.current.scale.setScalar(1);
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1;
        }
    }
  });

  // Geometry selection based on type
  const getGeometry = () => {
    switch (type) {
      case NodeType.Client:
        return <boxGeometry args={[0.8, 0.5, 0.6]} />; // Laptop-ish
      case NodeType.Firewall:
        return <boxGeometry args={[0.2, 1.5, 1.5]} />; // Tall thin wall
      case NodeType.DB:
        return <cylinderGeometry args={[0.4, 0.4, 1, 16]} />;
      case NodeType.Internet:
        return <icosahedronGeometry args={[0.6, 1]} />;
      case NodeType.WAF:
        return <dodecahedronGeometry args={[0.5, 0]} />;
      default:
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
    }
  };

  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>

      {/* Main Object */}
      <mesh ref={meshRef} castShadow receiveShadow>
        {getGeometry()}
        <meshStandardMaterial 
            color={isHighlighted ? '#ffffff' : color} 
            emissive={color}
            emissiveIntensity={isHighlighted ? 0.8 : 0.2}
            roughness={0.3}
            metalness={0.8}
        />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.8, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
        <div className={`px-3 py-1.5 rounded text-sm font-bold whitespace-nowrap transition-all duration-300 pointer-events-none select-none
            ${isHighlighted ? 'bg-cyan-500/80 text-white scale-110 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-slate-900/60 text-slate-300 border border-slate-700'}`}>
          {label}
        </div>
      </Html>
      
      {/* Floor reflection/shadow anchor */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <ringGeometry args={[0.4, 0.5, 32]} />
         <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};