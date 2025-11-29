export const foliageVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aRandom;
  
  varying vec3 vColor;
  varying float vRandom;
  
  void main() {
    vColor = aColor;
    vRandom = aRandom;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Size attenuation based on depth
    gl_PointSize = aSize * uPixelRatio * (40.0 / -mvPosition.z);
    
    // Subtle breathing animation
    float breathe = sin(uTime * 2.0 + aRandom * 10.0) * 0.1 + 0.9;
    gl_PointSize *= breathe;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const foliageFragmentShader = `
  varying vec3 vColor;
  varying float vRandom;
  
  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft glow edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    // Sparkle effect
    float sparkle = step(0.98, fract(vRandom * 100.0 + gl_FragCoord.x * 0.01));
    vec3 finalColor = vColor + vec3(sparkle * 0.5);
    
    gl_FragColor = vec4(finalColor, glow);
  }
`;