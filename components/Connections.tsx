import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { NETWORK_NODES } from '../constants';

export const Connections: React.FC = () => {
  // Define the network topology (pairs of connected nodes)
  const connections = useMemo(() => {
     // A simple bus/star hybrid for visualization
     // Client <-> Internet <-> FW <-> LB
     // LB <-> WAF
     // LB <-> App
     // App <-> Auth
     // App <-> DB
     // App <-> SIEM (Logical)
     // FW <-> SIEM (Logical)
     return [
        [0, 1], // Client - Internet
        [1, 2], // Internet - FW
        [2, 3], // FW - LB
        [3, 4], // LB - WAF
        [3, 5], // LB - App
        [5, 6], // App - Auth
        [5, 7], // App - DB
        [5, 8], // App - SIEM
        [2, 8], // FW - SIEM
     ];
  }, []);

  return (
    <group>
      {connections.map(([startIdx, endIdx], i) => {
        const start = new THREE.Vector3(...NETWORK_NODES[startIdx].position);
        const end = new THREE.Vector3(...NETWORK_NODES[endIdx].position);
        // Raise lines slightly off floor
        start.y = 0.5;
        end.y = 0.5;

        return (
          <Line
            key={i}
            points={[start, end]}
            color="#1e293b"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        );
      })}
    </group>
  );
};
