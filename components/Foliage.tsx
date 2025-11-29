import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { foliageVertexShader, foliageFragmentShader } from '../shaders/foliageShaders';

interface FoliageProps {
  count: number;
  treeState: TreeState;
}

export const Foliage: React.FC<FoliageProps> = ({ count, treeState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Initialize data
  const { positions, colors, sizes, randoms, chaosPositions, targetPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const rnd = new Float32Array(count);
    const chaosPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3);

    const baseColor = new THREE.Color("#004225"); // Deep Emerald
    const tipColor = new THREE.Color("#0f5f38"); // Lighter Green
    const goldColor = new THREE.Color("#FFD700"); // Gold specs

    for (let i = 0; i < count; i++) {
      // 1. Generate Target Positions (Cone Shape)
      const height = Math.random() * 18 - 9; // -9 to 9
      const normalizedY = (height + 9) / 18; // 0 to 1
      const maxRadius = 6 * (1 - normalizedY) + 0.5; // Taper to top
      
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      const tx = Math.cos(angle) * radius;
      const ty = height;
      const tz = Math.sin(angle) * radius;

      targetPos[i * 3] = tx;
      targetPos[i * 3 + 1] = ty;
      targetPos[i * 3 + 2] = tz;

      // 2. Generate Chaos Positions (Sphere/Cloud)
      const cx = (Math.random() - 0.5) * 50;
      const cy = (Math.random() - 0.5) * 50;
      const cz = (Math.random() - 0.5) * 50;

      chaosPos[i * 3] = cx;
      chaosPos[i * 3 + 1] = cy;
      chaosPos[i * 3 + 2] = cz;

      // Start at Chaos
      pos[i * 3] = cx;
      pos[i * 3 + 1] = cy;
      pos[i * 3 + 2] = cz;

      // 3. Attributes
      const isGold = Math.random() > 0.95;
      const finalColor = isGold ? goldColor : baseColor.clone().lerp(tipColor, Math.random());
      
      col[i * 3] = finalColor.r;
      col[i * 3 + 1] = finalColor.g;
      col[i * 3 + 2] = finalColor.b;

      siz[i] = Math.random() * 1.5 + 0.5;
      rnd[i] = Math.random();
    }

    return {
      positions: pos,
      colors: col,
      sizes: siz,
      randoms: rnd,
      chaosPositions: chaosPos,
      targetPositions: targetPos
    };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  }), []);

  // Animation Logic
  const currentProgress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update Uniforms
    uniforms.uTime.value = state.clock.elapsedTime;
    
    // Calculate transition progress
    const targetProgress = treeState === TreeState.FORMED ? 1 : 0;
    // Smooth lerp for the global progress
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetProgress, delta * 1.5);

    const positionsAttribute = meshRef.current.geometry.attributes.position;
    
    // Update individual particle positions
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Add a little randomness to the speed of each particle based on its random attribute
      // This makes the transition feel more organic/dust-like rather than rigid
      const localProgress = THREE.MathUtils.clamp(
        (currentProgress.current - randoms[i] * 0.3) / 0.7, 
        0, 
        1
      );
      
      // Cubic ease in/out
      const ease = localProgress < 0.5 
        ? 4 * localProgress * localProgress * localProgress 
        : 1 - Math.pow(-2 * localProgress + 2, 3) / 2;

      const x = THREE.MathUtils.lerp(chaosPositions[ix], targetPositions[ix], ease);
      const y = THREE.MathUtils.lerp(chaosPositions[iy], targetPositions[iy], ease);
      const z = THREE.MathUtils.lerp(chaosPositions[iz], targetPositions[iz], ease);

      positionsAttribute.setXYZ(i, x, y, z);
    }
    
    positionsAttribute.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};