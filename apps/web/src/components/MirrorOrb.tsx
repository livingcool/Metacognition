'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface OrbCoreProps {
  amplitude: number;
  assumptionLoad?: number;
  emotionalSignal?: number;
  isStreaming?: boolean;
  isRecording?: boolean;
  intensity?: number;
  mode?: 'calibration' | 'reality' | 'patterns' | 'chat' | 'synthesis';
}

const MODE_COLORS = {
  calibration: { mid: "#a78bfa", edge: "#4c1d95" }, // Metanoia violet
  reality: { mid: "#fb7185", edge: "#881337" }, // Rose tension
  patterns: { mid: "#34d399", edge: "#064e3b" }, // Mythos emerald
  chat: { mid: "#60a5fa", edge: "#1e3a8a" }, // Logos blue
  synthesis: { mid: "#fde047", edge: "#713f12" }, // Golden
  default: { mid: "#ff00fb", edge: "#1a0044" }
};

const EnergeticNebulaMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uColorCenter: { value: new THREE.Color("#ffffff") },
    uColorMid: { value: new THREE.Color("#ff00fb") },
    uColorEdge: { value: new THREE.Color("#1a0044") },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  // ... (vertexShader remains same)
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    uniform float uAmplitude;

    // Standard Simplex Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      vPosition = position;
      
      float noise = snoise(position * 2.0 + uTime * 0.5);
      vec3 newPosition = position + normal * noise * (0.05 + uAmplitude * 0.2);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    uniform float uAmplitude;
    uniform vec3 uColorCenter;
    uniform vec3 uColorMid;
    uniform vec3 uColorEdge;

    // Simple Hash for Grain
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float dist = length(vPosition);
      
      // 1. Core Intensity
      float core = 1.0 - smoothstep(0.0, 0.4, dist);
      core = pow(core, 2.0);
      
      // 2. Mid Energy (Electric Pink/Purple)
      float mid = smoothstep(0.2, 0.6, dist) * (1.0 - smoothstep(0.6, 1.0, dist));
      
      // 3. Noise / Grain Layer
      float grain = hash(vUv * 1000.0 + uTime) * 0.15;
      
      // 4. Color Blending
      vec3 finalColor = mix(uColorEdge, uColorMid, mid + uAmplitude);
      finalColor = mix(finalColor, uColorCenter, core * 1.5);
      
      // Add Grain
      finalColor += grain;
      
      // 5. Fresnel Effect for soft edges
      float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 3.0);
      finalColor += fresnel * 0.2;

      gl_FragColor = vec4(finalColor, 0.9);
    }
  `,
};

const OrbCore = React.memo(({ amplitude = 0, mode = 'chat', isStreaming, isRecording, intensity = 1 }: OrbCoreProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const targetColors = useMemo(() => {
    const palette = MODE_COLORS[mode] || MODE_COLORS.default;
    return {
      mid: new THREE.Color(palette.mid),
      edge: new THREE.Color(palette.edge)
    };
  }, [mode]);

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;
    
    // Use performance.now() / 1000 instead of state.clock.elapsedTime to avoid deprecation and instability
    const t = state.get().performance.current / 1000;
    
    // Normal speed vs. Thinking speed (Loading state)
    const timeSpeed = isStreaming ? t * 2.5 : t;
    
    materialRef.current.uniforms.uTime.value = timeSpeed;
    materialRef.current.uniforms.uAmplitude.value = amplitude;

    // Smooth color lerping
    materialRef.current.uniforms.uColorMid.value.lerp(targetColors.mid, 0.05);
    materialRef.current.uniforms.uColorEdge.value.lerp(targetColors.edge, 0.05);
    
    if (lightRef.current) {
        lightRef.current.color.lerp(targetColors.mid, 0.05);
    }

    // Smooth pulsing - Higher frequency and displacement if thinking
    const pulseFreq = isStreaming ? 3.0 : 0.8;
    const pulseAmp = isStreaming ? 0.12 : 0.05;
    const scale = 1.2 + Math.sin(t * pulseFreq) * pulseAmp + (amplitude * 0.3);
    
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    
    // Accelerated rotation during thinking
    const rotationSpeed = isStreaming ? 0.04 : 0.005;
    meshRef.current.rotation.y += rotationSpeed;
    meshRef.current.rotation.z += rotationSpeed * 0.5;
  });

  const energeticMaterial = useMemo(() => new THREE.ShaderMaterial({
    ...EnergeticNebulaMaterial,
    transparent: true,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={energeticMaterial} ref={materialRef} attach="material" />
      </mesh>

      <pointLight 
        ref={lightRef}
        intensity={10 + (amplitude * 20)} 
        color="#ff00fb" 
        distance={5} 
      />
      <pointLight 
        intensity={5} 
        color="#ffffff" 
        distance={2} 
      />
    </group>
  );
});

OrbCore.displayName = 'OrbCore';



export const MirrorOrb = (props: Partial<OrbCoreProps>) => {
  const { intensity = 0.5 } = props;
  const [isMounted, setIsMounted] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Task 2.6: Subtle Constant Glow (Slow orbital movement) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            x: [Math.sin(0) * 100, Math.sin(Math.PI * 0.5) * 100, Math.sin(Math.PI) * 100, Math.sin(Math.PI * 1.5) * 100, Math.sin(Math.PI * 2) * 100],
            y: [Math.cos(0) * 100, Math.cos(Math.PI * 0.5) * 100, Math.cos(Math.PI) * 100, Math.cos(Math.PI * 1.5) * 100, Math.cos(Math.PI * 2) * 100],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px]"
        />
      </div>
      
      <AnimatePresence>
        {!isCrashed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative z-10"
          >
            <Canvas 
              key="mirror-orb-canvas"
              gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
              dpr={[1, 1.5]}
              onError={() => setIsCrashed(true)}
            >
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={35} />
                
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
                
                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.1}>
                  <OrbCore 
                    amplitude={props.amplitude ?? 0}
                    assumptionLoad={props.assumptionLoad}
                    emotionalSignal={props.emotionalSignal}
                    isStreaming={props.isStreaming}
                    isRecording={props.isRecording}
                    intensity={props.intensity}
                  />
                </Float>
                
                <Environment preset="night" />
              </Suspense>
            </Canvas>
          </motion.div>
        ) : (
          <div className="w-48 h-48 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse" />
        )}
      </AnimatePresence>
    </div>
  );
};
