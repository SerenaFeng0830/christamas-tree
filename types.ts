import * as THREE from 'three';

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface ParticleData {
  chaosPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  color: THREE.Color;
  size: number;
  speed: number; // For varying animation speed
  offset: number; // Random time offset
}

export interface OrnamentData {
  id: number;
  chaosPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
  type: 'box' | 'ball' | 'light';
}