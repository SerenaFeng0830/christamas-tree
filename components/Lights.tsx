import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface LightsProps {
  count: number;
  treeState: TreeState;
}

export const Lights: React.FC<LightsProps> = ({ count, treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const chaosPos = [];
    const targetPos = [];
    const phases = [];

    for (let i = 0; i < count; i++) {
      // Chaos: Wide spread
      chaosPos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80
      ));

      // Target: Spiraling around the cone
      const height = Math.random() * 18 - 9;
      const normalizedY = (height + 9) / 18;
      const maxRadius = 6.2 * (1 - normalizedY); 
      const angle = Math.random() * Math.PI * 10; // Spiral
      const radius = maxRadius + 0.2;

      targetPos.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ));

      phases.push(Math.random() * Math.PI * 2);
    }
    return { chaosPos, targetPos, phases };
  }, [count]);

  const currentProgress = useRef(0);
  const color1 = new THREE.Color("#ffaa00"); // Warm Yellow
  const color2 = new THREE.Color("#fffae0"); // Bright White
  const tempColor = new THREE.Color();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetP = treeState === TreeState.FORMED ? 1 : 0;
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetP, delta * 0.8);

    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const { chaosPos, targetPos, phases } = data;
      
      // Lights move fastest/easiest
      const ease = THREE.MathUtils.smoothstep(currentProgress.current, 0, 1);
      
      dummy.position.lerpVectors(chaosPos[i], targetPos[i], ease);
      dummy.scale.setScalar(0.15); // Small bulbs
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Blinking Logic
      const blink = Math.sin(time * 3 + phases[i]);
      const activeColor = blink > 0 ? color1 : color2;
      
      // Dim when in chaos, bright when formed
      const intensity = (blink * 0.5 + 0.5) * (0.2 + 0.8 * ease); 
      
      tempColor.copy(activeColor).multiplyScalar(intensity * 10); // High intensity for bloom
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};