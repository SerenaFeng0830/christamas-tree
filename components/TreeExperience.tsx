import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeState } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Lights } from './Lights';

interface TreeExperienceProps {
  treeState: TreeState;
}

const SceneContent: React.FC<TreeExperienceProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Slow rotation when formed for majestic feel
    if (treeState === TreeState.FORMED) {
      groupRef.current.rotation.y += 0.002;
    } else {
        // Drifting rotation in chaos
       groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The Needles */}
      <Foliage count={15000} treeState={treeState} />
      
      {/* The Gifts (Boxes) - Gold, Red, Silver */}
      <Ornaments 
        count={80} 
        type="box" 
        treeState={treeState} 
        colorPalette={["#B22222", "#FFD700", "#C0C0C0", "#800000"]} 
      />
      
      {/* The Baubles (Balls) - Gold, Green, Red */}
      <Ornaments 
        count={300} 
        type="ball" 
        treeState={treeState} 
        colorPalette={["#FFD700", "#006400", "#B22222", "#DAA520"]} 
      />

      {/* Fairy Lights */}
      <Lights count={400} treeState={treeState} />
      
      {/* Top Star */}
      <Star treeState={treeState} />
    </group>
  );
};

const Star = ({ treeState }: { treeState: TreeState }) => {
    const ref = useRef<THREE.Group>(null);
    const progress = useRef(0);

    useFrame((state, delta) => {
        if(!ref.current) return;
        const target = treeState === TreeState.FORMED ? 1 : 0;
        progress.current = THREE.MathUtils.lerp(progress.current, target, delta);
        
        // Position interpolation
        const yPos = THREE.MathUtils.lerp(20, 9.5, progress.current);
        ref.current.position.set(0, yPos, 0);
        
        // Scale and spin
        const scale = THREE.MathUtils.lerp(0, 1.5, progress.current);
        ref.current.scale.setScalar(scale);
        ref.current.rotation.y += delta;
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    });

    return (
        <group ref={ref}>
            <mesh>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFD700" 
                    emissiveIntensity={2} 
                    metalness={1} 
                    roughness={0} 
                />
            </mesh>
            <pointLight intensity={5} distance={10} color="#ffaa00" />
        </group>
    )
}

export const TreeExperience: React.FC<TreeExperienceProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]} // Quality scaling
      camera={{ position: [0, 2, 22], fov: 45 }}
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
    >
      <color attach="background" args={['#020402']} />
      
      <SceneContent treeState={treeState} />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffeebb" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#0044aa" /> {/* Cool rim light */}

      <Environment preset="lobby" background={false} blur={1} />
      <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" />

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={35}
      />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};