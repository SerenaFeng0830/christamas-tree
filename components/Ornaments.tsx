import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface OrnamentsProps {
  count: number;
  type: 'box' | 'ball';
  treeState: TreeState;
  colorPalette: string[];
}

export const Ornaments: React.FC<OrnamentsProps> = ({ count, type, treeState, colorPalette }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions and attributes
  const data = useMemo(() => {
    const chaosPos = [];
    const targetPos = [];
    const rotations = [];
    const scales = [];
    const colors = [];
    const speeds = [];

    const _color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Chaos
      chaosPos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      ));

      // Target (Surface of cone)
      const height = Math.random() * 16 - 8;
      const normalizedY = (height + 9) / 18;
      const maxRadius = 5.5 * (1 - normalizedY);
      // Place specifically on the surface (radius ~ maxRadius) for ornaments
      const angle = Math.random() * Math.PI * 2;
      const radius = maxRadius + (Math.random() * 0.5); // Slightly varied depth

      targetPos.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ));

      rotations.push(new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ));

      // Scales
      const baseScale = type === 'box' ? 0.6 : 0.4;
      scales.push(Math.random() * 0.4 + baseScale);

      // Colors
      const hex = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      _color.set(hex);
      colors.push(_color.clone());
      
      // Animation speed variance (weight)
      // Boxes are "heavier" (slower), Balls are "lighter"
      const weight = type === 'box' ? 0.8 : 1.2;
      speeds.push((Math.random() * 0.5 + 0.5) * weight);
    }
    return { chaosPos, targetPos, rotations, scales, colors, speeds };
  }, [count, type, colorPalette]);

  // Set initial colors
  useLayoutEffect(() => {
    if (meshRef.current) {
      data.colors.forEach((col, i) => {
        meshRef.current?.setColorAt(i, col);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  const currentProgress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetP = treeState === TreeState.FORMED ? 1 : 0;
    // Move main progress
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetP, delta * 1.0);

    for (let i = 0; i < count; i++) {
      const { chaosPos, targetPos, rotations, scales, speeds } = data;

      // Individual progress calculation
      // Adjust progress based on "speed/weight"
      // We clamp so it doesn't overshoot
      let itemProgress = THREE.MathUtils.clamp(currentProgress.current * speeds[i], 0, 1);
      
      // Add elasticity/bounce only when forming
      if (treeState === TreeState.FORMED && itemProgress > 0.8) {
         // Subtle elastic finish
         // Simply using smoothstep for now to keep it classy
         itemProgress = THREE.MathUtils.smoothstep(itemProgress, 0, 1);
      }

      // Interpolate position
      dummy.position.lerpVectors(chaosPos[i], targetPos[i], itemProgress);
      
      // Interpolate rotation (spin when moving)
      dummy.rotation.set(
        rotations[i].x + (1 - itemProgress) * 2, // Spin more when chaotic
        rotations[i].y + (1 - itemProgress) * 2,
        rotations[i].z
      );

      dummy.scale.setScalar(scales[i] * (0.5 + 0.5 * itemProgress)); // Grow slightly as they arrive
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      {type === 'box' ? <boxGeometry /> : <sphereGeometry args={[1, 16, 16]} />}
      <meshStandardMaterial 
        roughness={0.2} 
        metalness={0.9} 
        emissive={type === 'ball' ? new THREE.Color("#222") : new THREE.Color("#000")}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};