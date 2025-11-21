import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, TorusKnot, Text, Float, Stars, Sparkles, Billboard, MeshDistortMaterial, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { FusionViewMode } from '../types';
import { RotateCcw, Zap, ArrowRightToLine, Expand, Activity } from 'lucide-react';

// --- Custom Shaders & Materials ---

// Procedural Texture for Field Lines
const useFieldLineTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 512, 512);
      
      // Create gradient lines
      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.fillStyle = grad;
      for (let i = 0; i < 16; i++) {
        const y = (i / 16) * 512;
        ctx.fillRect(0, y, 512, 2 + Math.random() * 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
};

// Common props for reactor components
interface ReactorProps {
  instabilityEnabled: boolean;
  intensity: number;
}

export type ReactionPhase = 'IDLE' | 'APPROACH' | 'MERGE' | 'EXPLODE';

// --- Transition Wrapper Component ---
const SceneTransition = ({ isVisible, children }: { isVisible: boolean, children?: React.ReactNode }) => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!group.current) return;
    
    const targetScale = isVisible ? 1 : 0;
    const targetRot = isVisible ? 0 : -Math.PI * 0.25;
    const speed = delta * 8; 
    
    const currentScale = group.current.scale.x;
    let nextScale = THREE.MathUtils.lerp(currentScale, targetScale, speed);
    if (Math.abs(nextScale - targetScale) < 0.001) nextScale = targetScale;
    
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRot, speed);
    group.current.scale.setScalar(nextScale);
    group.current.visible = nextScale > 0.01;
  });

  return <group ref={group} scale={0}>{children}</group>;
};

// --- Deuterium-Tritium Reaction Component ---
const Reaction = ({ phase }: { phase: ReactionPhase }) => {
  const groupRef = useRef<THREE.Group>(null);
  const deuteriumRef = useRef<THREE.Mesh>(null);
  const tritiumRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!deuteriumRef.current || !tritiumRef.current) return;

    const speed = 3 * delta;
    let dTarget = new THREE.Vector3(-3, 0, 0);
    let tTarget = new THREE.Vector3(3, 0, 0);
    let dScale = 0.8;
    let tScale = 0.8;

    switch(phase) {
        case 'APPROACH':
            dTarget.set(-0.65, 0, 0);
            tTarget.set(0.65, 0, 0);
            break;
        case 'MERGE':
            dTarget.set(0, 0, 0);
            tTarget.set(0, 0, 0);
            dScale = 1.4; 
            tScale = 1.4;
            break;
        case 'EXPLODE':
            dTarget.set(10, 5, 0);
            tTarget.set(-6, -3, 0);
            dScale = 0.4;
            tScale = 1.1;
            break;
    }

    deuteriumRef.current.position.lerp(dTarget, speed);
    tritiumRef.current.position.lerp(tTarget, speed);
    deuteriumRef.current.scale.lerp(new THREE.Vector3(dScale, dScale, dScale), speed);
    tritiumRef.current.scale.lerp(new THREE.Vector3(tScale, tScale, tScale), speed);
  });

  const isMerged = phase === 'MERGE';
  const isExploded = phase === 'EXPLODE';

  return (
    <group ref={groupRef}>
      <Sphere ref={deuteriumRef} args={[0.8, 64, 64]} position={[-3, 0, 0]}>
        <meshPhysicalMaterial 
          color={isExploded ? "#a0aec0" : (isMerged ? "#ffffff" : "#3b82f6")} 
          emissive={isExploded ? "#ffffff" : (isMerged ? "#ffffff" : "#1d4ed8")}
          emissiveIntensity={isMerged ? 5 : (isExploded ? 3 : 1.5)}
          metalness={0.1}
          roughness={0.2}
          transmission={0.2}
          thickness={1}
          clearcoat={1}
          toneMapped={false}
        />
      </Sphere>
      
      <Sphere ref={tritiumRef} args={[0.8, 64, 64]} position={[3, 0, 0]}>
        <meshPhysicalMaterial 
          color={isExploded ? "#86efac" : (isMerged ? "#ffffff" : "#ef4444")} 
          emissive={isExploded ? "#4ade80" : (isMerged ? "#ffffff" : "#b91c1c")}
          emissiveIntensity={isMerged ? 5 : (isExploded ? 3 : 1.5)}
          metalness={0.1}
          roughness={0.2}
          transmission={0.2}
          thickness={1}
          clearcoat={1}
          toneMapped={false}
        />
      </Sphere>

      <pointLight position={[0,0,0]} intensity={isMerged ? 50 : (isExploded ? 5 : 0)} distance={20} color={isMerged ? "#fff7ed" : "#ffffff"} decay={2} />
      
      {phase !== 'EXPLODE' && phase !== 'MERGE' && (
        <>
          <Billboard position={[-3, 1.5, 0]}>
            <Text fontSize={0.4} color="white" outlineWidth={0.02} outlineColor="black">Deuterium</Text>
          </Billboard>
          <Billboard position={[3, 1.5, 0]}>
            <Text fontSize={0.4} color="white" outlineWidth={0.02} outlineColor="black">Tritium</Text>
          </Billboard>
        </>
      )}
      {phase === 'EXPLODE' && (
        <>
           <Billboard position={[3, 3, 0]}>
             <Text fontSize={0.4} color="#a0aec0" outlineWidth={0.02} outlineColor="black">Neutron (14.1 MeV)</Text>
           </Billboard>
           <Billboard position={[-2, -2, 0]}>
             <Text fontSize={0.4} color="#48bb78" outlineWidth={0.02} outlineColor="black">Helium-4 (3.5 MeV)</Text>
           </Billboard>
        </>
      )}
    </group>
  );
};

// --- Tokamak Component ---
const Tokamak: React.FC<ReactorProps> = ({ instabilityEnabled, intensity }) => {
  const plasmaRef = useRef<THREE.Mesh>(null);
  const plasmaShellRef = useRef<THREE.Mesh>(null);
  const fieldLinesRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const warningRef = useRef<any>(null);
  
  const fieldTex = useFieldLineTexture();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const isUnstable = instabilityEnabled && intensity > 0;
    const instabilityFactor = isUnstable ? intensity : 0;

    // Random noise generator
    const noise = (Math.random() - 0.5) * instabilityFactor;

    // Core Plasma Logic
    if (plasmaRef.current) {
      plasmaRef.current.rotation.z += 0.05 + (instabilityFactor * 0.2);
      
      const breath = Math.sin(t * 4) * 0.05;
      const unstableScale = 1 + breath + (noise * 0.2);
      plasmaRef.current.scale.setScalar(unstableScale);

      // Erratic Flicker & Intensity Modulation
      if (isUnstable) {
         const flicker = (Math.random() - 0.5) * intensity * 5;
         const mat = plasmaRef.current.material as any;
         if (mat) mat.emissiveIntensity = 4 + (intensity * 6) + flicker;
         if (mat) mat.color.setHSL(0.0 + noise * 0.1, 1.0, 0.5); // Shift to Red/Orange
      } else {
         const mat = plasmaRef.current.material as any;
         if (mat) {
           mat.emissiveIntensity = 3.5;
           mat.color.set("#8b5cf6");
         }
      }
    }

    // Animate Field Lines (Texture Scroll)
    if (fieldLinesRef.current) {
        fieldTex.offset.x += 0.01 + (intensity * 0.05);
        fieldTex.offset.y += 0.005;
        const pulse = 1 + Math.sin(t * 3) * 0.05;
        fieldLinesRef.current.scale.setScalar(pulse);
    }

    // Outer Shell (Scrape-off layer)
    if (plasmaShellRef.current) {
       plasmaShellRef.current.rotation.z -= 0.02;
       const shellPulse = 1.1 + Math.sin(t * 2) * 0.02 + (noise * 0.1);
       plasmaShellRef.current.scale.setScalar(shellPulse);
    }

    // Warning Label Pulse
    if (warningRef.current) {
       warningRef.current.material.opacity = 0.6 + Math.sin(t * 10) * 0.4;
    }
  });

  const numCoils = 16;
  const isUnstable = instabilityEnabled && intensity > 0;

  return (
    <group ref={groupRef} rotation={[Math.PI / 3, 0, 0]}>
      
      {/* --- PLASMA CORE --- */}
      <Torus ref={plasmaRef} args={[3, 0.9, 128, 64]}>
        <MeshDistortMaterial
            color={isUnstable ? "#ef4444" : "#8b5cf6"} 
            emissive={isUnstable ? "#ea580c" : "#6d28d9"} 
            emissiveIntensity={3.5} 
            roughness={0} 
            metalness={0.1}
            distort={isUnstable ? 0.6 + intensity * 0.8 : 0.3} 
            speed={isUnstable ? 8 + intensity * 8 : 2.5}
            toneMapped={false} 
        />
      </Torus>

      {/* --- ANIMATED MAGNETIC FIELD LINES --- */}
      <Torus ref={fieldLinesRef} args={[3, 1.1, 64, 32]}>
        <meshBasicMaterial 
            map={fieldTex}
            transparent
            opacity={isUnstable ? 0.6 : 0.2}
            color={isUnstable ? "#fda4af" : "#38bdf8"}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
        />
      </Torus>

      {/* --- PLASMA SHELL (Volumetric Glow) --- */}
      <Torus ref={plasmaShellRef} args={[3, 1.3, 64, 32]}>
        <meshPhysicalMaterial 
          color={isUnstable ? "#fca5a5" : "#c4b5fd"} 
          emissive={isUnstable ? "#ef4444" : "#8b5cf6"}
          emissiveIntensity={isUnstable ? 2 + intensity : 0.5}
          transmission={0.7} 
          thickness={2.0} 
          roughness={0.2}
          ior={1.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </Torus>
      
      <Sparkles 
        count={instabilityEnabled ? 300 : 100} 
        scale={instabilityEnabled ? 14 : 10} 
        size={instabilityEnabled ? 10 : 5} 
        speed={instabilityEnabled ? 4 : 0.6} 
        opacity={0.6} 
        color={isUnstable ? "#fecaca" : "#e9d5ff"} 
      />

      {instabilityEnabled && intensity > 0.4 && (
         <Billboard position={[0, 4.5, 0]}>
             <Text 
                ref={warningRef}
                fontSize={0.4} 
                color="#ef4444"
                anchorX="center" 
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                font="https://fonts.gstatic.com/s/orbitron/v25/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1ny.woff"
             >
                ⚠ PLASMA INSTABILITY DETECTED
             </Text>
         </Billboard>
      )}

      {/* Structure */}
      <group>
        {/* TF Coils */}
        {Array.from({ length: numCoils }).map((_, i) => (
            <group key={i} rotation={[0, 0, (i / numCoils) * Math.PI * 2]}>
                <group position={[3.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <mesh>
                        <torusGeometry args={[1.5, 0.15, 16, 32]} />
                        <meshPhysicalMaterial 
                            color="#1e293b" 
                            metalness={0.9} 
                            roughness={0.3} 
                            emissive="#0ea5e9"
                            emissiveIntensity={0.2}
                            clearcoat={0.8}
                        />
                    </mesh>
                </group>
                <mesh position={[3.2, 1.6, 0]}>
                    <boxGeometry args={[0.5, 0.2, 0.4]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.5} />
                </mesh>
                <mesh position={[3.2, -1.6, 0]}>
                    <boxGeometry args={[0.5, 0.2, 0.4]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.5} />
                </mesh>
            </group>
        ))}
        
        {/* PF Coils */}
        {[2, -2].map((zPos, idx) => (
            <group key={`pf-${idx}`} position={[0, 0, zPos]} rotation={[Math.PI/2, 0, 0]}>
                <mesh>
                    <torusGeometry args={[4.5, 0.15, 16, 64]} />
                    <meshPhysicalMaterial 
                        color="#312e81" 
                        metalness={0.8} 
                        roughness={0.2} 
                        emissive="#6366f1" 
                        emissiveIntensity={0.3}
                    />
                </mesh>
            </group>
        ))}

        <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 5, 32]} />
            <meshPhysicalMaterial color="#334155" metalness={0.7} roughness={0.3} clearcoat={0.5} />
        </mesh>
      </group>

      {!instabilityEnabled && (
        <>
          <Billboard position={[5.2, 0, 0]}>
            <Text fontSize={0.3} color="#e2e8f0" anchorX="left" outlineWidth={0.02} outlineColor="black">
              ← Toroidal Field Coils
            </Text>
             <Text position={[0.2, -0.35, 0]} fontSize={0.18} color="#94a3b8" anchorX="left" outlineWidth={0.02} outlineColor="black">
              Generates primary confinement field
            </Text>
          </Billboard>

          <Billboard position={[0, 5.5, 2]}>
            <Text fontSize={0.3} color="#e2e8f0" anchorX="center" outlineWidth={0.02} outlineColor="black">
              Poloidal Field Coils ↓
            </Text>
             <Text position={[0, -0.35, 0]} fontSize={0.18} color="#94a3b8" anchorX="center" outlineWidth={0.02} outlineColor="black">
              Controls plasma shape & stability
            </Text>
          </Billboard>
        </>
      )}
      
    </group>
  );
};

// --- Stellarator Component ---
const Stellarator: React.FC<ReactorProps & { twist: number }> = ({ instabilityEnabled, intensity, twist }) => {
  const plasmaRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const fluxSurfaceRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const warningRef = useRef<any>(null);
  const fieldTex = useFieldLineTexture();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const isUnstable = instabilityEnabled && intensity > 0;
    const noise = () => (Math.random() - 0.5) * intensity;

    if (plasmaRef.current && cageRef.current) {
      const rotSpeed = 1 + (isUnstable ? intensity : 0);
      plasmaRef.current.rotation.x = t * 0.1 * rotSpeed;
      plasmaRef.current.rotation.y = t * 0.15 * rotSpeed;
      
      cageRef.current.rotation.x = t * 0.1;
      cageRef.current.rotation.y = t * 0.15;
      
      if (fluxSurfaceRef.current) {
          fluxSurfaceRef.current.rotation.x = t * 0.1;
          fluxSurfaceRef.current.rotation.y = t * 0.15;
          fieldTex.offset.x -= 0.02;
      }

      const breath = Math.sin(t * 2) * 0.02;
      plasmaRef.current.scale.setScalar(1 + breath + (isUnstable ? noise() * 0.1 : 0));

      if (isUnstable) {
         const flicker = (Math.random() - 0.5) * intensity * 8;
         const mat = plasmaRef.current.material as any;
         if (mat) {
             mat.emissiveIntensity = 4 + (intensity * 5) + flicker;
             mat.color.setHSL(0.05 + noise() * 0.1, 1.0, 0.5); // Orange/Red erratic
         }
      } else {
         const mat = plasmaRef.current.material as any;
         if (mat) {
             mat.emissiveIntensity = 3;
             mat.color.set("#4f46e5");
         }
      }
    }

    if (groupRef.current && isUnstable) {
        groupRef.current.position.x = noise() * 0.05;
        groupRef.current.position.y = noise() * 0.05;
    }

    if (warningRef.current) {
        warningRef.current.material.opacity = 0.5 + Math.sin(t * 15) * 0.5;
     }
  });
  
  const isUnstable = instabilityEnabled && intensity > 0;

  return (
    <group ref={groupRef}>
        <TorusKnot ref={plasmaRef} args={[2.2, 0.5, 200, 64, 2, twist]}>
           <MeshDistortMaterial
             color={isUnstable ? "#f97316" : "#4f46e5"} 
             emissive={isUnstable ? "#b91c1c" : "#4338ca"} 
             emissiveIntensity={3} 
             roughness={0}
             metalness={0}
             distort={isUnstable ? 1.0 : 0.4}
             speed={isUnstable ? 12 : 4}
             toneMapped={false}
           />
        </TorusKnot>
        
        {/* Animated Flux Surface (Field Lines) */}
        <TorusKnot ref={fluxSurfaceRef} args={[2.2, 0.6, 200, 64, 2, twist]}>
            <meshBasicMaterial 
              map={fieldTex}
              transparent
              opacity={0.15}
              color={isUnstable ? "#ffaa33" : "#818cf8"}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
        </TorusKnot>

        {/* Magnetic Cage Structure */}
        <TorusKnot ref={cageRef} args={[2.2, 0.7, 200, 32, 2, twist]}>
            <meshStandardMaterial 
              wireframe
              color={isUnstable && intensity > 0.7 ? "#ef4444" : "#64748b"} 
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
        </TorusKnot>
        
        <Sparkles count={150} scale={9} size={5} speed={instabilityEnabled ? 2 : 0.4} opacity={0.5} color="#818cf8" />

        {instabilityEnabled && intensity > 0.4 && (
         <Billboard position={[0, 3.5, 0]}>
             <Text 
                ref={warningRef}
                fontSize={0.4} 
                color="#ef4444"
                anchorX="center" 
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
             >
                ⚠ MAGNETIC ISLANDS FORMING
             </Text>
         </Billboard>
      )}
    </group>
  );
};

// --- Inertial Confinement Component ---
const InertialConfinement: React.FC<ReactorProps> = ({ instabilityEnabled, intensity }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pelletRef = useRef<THREE.Mesh>(null);
  const lasersRef = useRef<THREE.Group>(null);
  const warningRef = useRef<any>(null);
  const [phase, setPhase] = useState<'charge' | 'fire' | 'explode'>('charge');
  
  const laserPositions = useMemo(() => {
    const pos = [];
    const count = 32;
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
       const y = 1 - (i / (count - 1)) * 2;
       const radius = Math.sqrt(1 - y * y);
       const theta = phi * i;
       const x = Math.cos(theta) * radius;
       const z = Math.sin(theta) * radius;
       pos.push(new THREE.Vector3(x, y, z).multiplyScalar(4));
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cycle = t % 4; 

    const isUnstable = instabilityEnabled && intensity > 0.3;
    const noise = () => (Math.random() - 0.5) * intensity;

    if (cycle < 2.0) {
       if (phase !== 'charge') setPhase('charge');
    } else if (cycle < 2.5) {
       if (phase !== 'fire') setPhase('fire');
    } else {
       if (phase !== 'explode') setPhase('explode');
    }

    // Glitch Effect for Inertial
    if (groupRef.current) {
        if (isUnstable && Math.random() < (0.1 * intensity)) {
             const glitchStrength = intensity * 0.2;
             groupRef.current.position.set(
                (Math.random() - 0.5) * glitchStrength,
                (Math.random() - 0.5) * glitchStrength,
                (Math.random() - 0.5) * glitchStrength
             );
             const scaleJitter = 1 + (Math.random() - 0.5) * intensity * 0.1;
             groupRef.current.scale.setScalar(scaleJitter);
        } else {
             groupRef.current.position.set(0,0,0);
             groupRef.current.scale.setScalar(1);
        }
    }

    if (pelletRef.current) {
       const mat = pelletRef.current.material as THREE.MeshPhysicalMaterial;
       
       if (phase === 'charge') {
         pelletRef.current.scale.setScalar(1);
         mat.color.set("#fbbf24"); 
         mat.emissive.set("#f59e0b");
         mat.emissiveIntensity = 0.1;
         mat.roughness = 0.1;
         mat.metalness = 1;
         mat.clearcoat = 1;

       } else if (phase === 'fire') {
         const progress = (cycle - 2.0) / 0.5; 
         const shrink = 1 - (progress * 0.8); 
         const wobble = isUnstable ? noise() * 0.5 : 0;
         pelletRef.current.scale.set(shrink + wobble, shrink - wobble, shrink + wobble);
         mat.color.set("#ffffff");
         mat.emissive.set("#ffffff");
         mat.emissiveIntensity = 2 + progress * 20;
         mat.metalness = 0; 
       } else {
         const progress = (cycle - 2.5) / 1.5;
         const expand = progress * (isUnstable ? 2 : 5); 
         pelletRef.current.scale.setScalar(expand);
         mat.emissiveIntensity = (1 - progress) * (isUnstable ? 10 : 100);
         const col = isUnstable ? "#ef4444" : "#3b82f6";
         mat.color.set(col); 
         mat.emissive.set(col);
       }
    }

    if (lasersRef.current) {
      lasersRef.current.children.forEach((laser) => {
        const mat = (laser as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (phase === 'charge') {
           const chargeLevel = (cycle / 2.0);
           laser.visible = true;
           laser.scale.set(chargeLevel * 0.05, 1, chargeLevel * 0.05);
           mat.opacity = chargeLevel * 0.3;
        } else if (phase === 'fire') {
           laser.scale.set(0.15, 1, 0.15);
           mat.opacity = 0.8;
           if (isUnstable && Math.random() > 0.8) laser.visible = false;
        } else {
           laser.visible = false;
        }
      });
    }

    if (warningRef.current) {
      warningRef.current.material.opacity = isUnstable ? 1 : 0;
      warningRef.current.visible = isUnstable;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere ref={pelletRef} args={[0.5, 64, 64]}>
        <meshPhysicalMaterial 
          color="#fbbf24" 
          emissive="#f59e0b"
          emissiveIntensity={0.1}
          metalness={1.0}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          toneMapped={false}
        />
      </Sphere>

      <group ref={lasersRef}>
        {laserPositions.map((pos, i) => {
           const mid = pos.clone().multiplyScalar(0.5);
           const dist = pos.length();
           
           return (
             <mesh key={`beam-${i}`} position={mid} onUpdate={self => self.lookAt(0,0,0)}>
                <cylinderGeometry args={[1, 1, dist, 8]} />
                {/* Enhanced Laser Material: Additive blending for beam look */}
                <meshBasicMaterial 
                  color="#10b981" 
                  transparent
                  opacity={0}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
                <group rotation={[Math.PI/2, 0, 0]} /> 
             </mesh>
           )
        })}
      </group>

      <Billboard position={[0, 3, 0]}>
        <Text 
            ref={warningRef}
            fontSize={0.4} 
            color="#ef4444"
            visible={false}
            anchorX="center" 
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
        >
            ⚠ ASYMMETRIC COMPRESSION
        </Text>
      </Billboard>

    </group>
  );
};

interface FusionSceneProps {
  mode: FusionViewMode;
  instabilityEnabled?: boolean;
  instabilityIntensity?: number;
}

const FusionScene: React.FC<FusionSceneProps> = ({ mode, instabilityEnabled = false, instabilityIntensity = 0 }) => {
  const [reactionPhase, setReactionPhase] = useState<ReactionPhase>('IDLE');
  const [stellaratorTwist, setStellaratorTwist] = useState(3);

  // Sound Effect Logic
  const playReactionSound = (phase: ReactionPhase) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.2; 
    masterGain.connect(ctx.destination);

    if (phase === 'APPROACH') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.8);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.1);
        gain.gain.linearRampToValueAtTime(0, t + 0.8);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.8);
    } 
    else if (phase === 'MERGE') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }
    else if (phase === 'EXPLODE') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(50, t + 1.5);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(t);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl relative">
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }} gl={{ toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
        <OrbitControls 
          makeDefault
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          zoomSpeed={0.6}
          enablePan={true}
          panSpeed={0.6}
          rotateSpeed={0.6}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4c1d95" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        
        <Float speed={instabilityEnabled ? 5 : 1.5} rotationIntensity={instabilityEnabled ? 2 : 0.2} floatIntensity={0.5}>
          <SceneTransition isVisible={mode === FusionViewMode.REACTION}>
            <Reaction phase={reactionPhase} />
          </SceneTransition>
          <SceneTransition isVisible={mode === FusionViewMode.TOKAMAK}>
            <Tokamak instabilityEnabled={instabilityEnabled} intensity={instabilityIntensity} />
          </SceneTransition>
          <SceneTransition isVisible={mode === FusionViewMode.STELLARATOR}>
            <Stellarator instabilityEnabled={instabilityEnabled} intensity={instabilityIntensity} twist={stellaratorTwist} />
          </SceneTransition>
          <SceneTransition isVisible={mode === FusionViewMode.INERTIAL}>
            <InertialConfinement instabilityEnabled={instabilityEnabled} intensity={instabilityIntensity} />
          </SceneTransition>
        </Float>
        
      </Canvas>
      
      {mode === FusionViewMode.REACTION && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-xl z-20">
          <button 
            onClick={() => setReactionPhase('IDLE')}
            className={`p-2 rounded-full transition-all flex items-center gap-2 ${reactionPhase === 'IDLE' ? 'bg-gray-700 text-white' : 'hover:bg-white/10 text-gray-400'}`}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button 
            onClick={() => { setReactionPhase('APPROACH'); playReactionSound('APPROACH'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${reactionPhase === 'APPROACH' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'hover:bg-white/10 text-gray-300'}`}
          >
            <ArrowRightToLine className="w-3 h-3" />
            Approach
          </button>
          <button 
            onClick={() => { setReactionPhase('MERGE'); playReactionSound('MERGE'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${reactionPhase === 'MERGE' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'hover:bg-white/10 text-gray-300'}`}
          >
            <Zap className="w-3 h-3" />
            Merge
          </button>
          <button 
            onClick={() => { setReactionPhase('EXPLODE'); playReactionSound('EXPLODE'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${reactionPhase === 'EXPLODE' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'hover:bg-white/10 text-gray-300'}`}
          >
            <Expand className="w-3 h-3" />
            Explode
          </button>
        </div>
      )}

      {mode === FusionViewMode.STELLARATOR && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-xl z-20">
           <Activity className="w-4 h-4 text-indigo-400" />
           <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider hidden sm:inline">Magnetic Twist</span>
           <input 
              type="range" 
              min="1" 
              max="8" 
              step="1" 
              value={stellaratorTwist}
              onChange={(e) => setStellaratorTwist(parseInt(e.target.value))}
              className="w-32 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-indigo-400 transition-all"
           />
           <span className="text-xs font-mono text-white w-4 text-center">{stellaratorTwist}</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-4 rounded-lg border border-white/10 pointer-events-none transition-all duration-300">
        <h3 className={`text-lg font-orbitron mb-1 ${instabilityEnabled && instabilityIntensity > 0.6 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
          {instabilityEnabled && instabilityIntensity > 0.6 && 'CRITICAL WARNING: '}
          {mode === FusionViewMode.REACTION && 'D-T Fusion Reaction'}
          {mode === FusionViewMode.TOKAMAK && 'Tokamak Magnetic Confinement'}
          {mode === FusionViewMode.STELLARATOR && 'Stellarator Twisted Confinement'}
          {mode === FusionViewMode.INERTIAL && 'Inertial Confinement Fusion'}
        </h3>
        <p className="text-sm text-gray-300">
          {mode === FusionViewMode.REACTION && 'Deuterium and Tritium fuse at extreme temperatures to form Helium and a high-energy Neutron. This releases 17.6 MeV of energy.'}
          {mode === FusionViewMode.TOKAMAK && 'Superconducting magnets (vertical D-shape) and Poloidal Field coils (horizontal rings) confine 150M°C plasma in a torus shape.'}
          {mode === FusionViewMode.STELLARATOR && 'Complex, twisted magnetic coils confine plasma in a Mobius-strip-like loop, eliminating the need for a large plasma current and offering continuous operation stability.'}
          {mode === FusionViewMode.INERTIAL && 'High-powered lasers strike a fuel pellet (or a surrounding hohlraum), compressing it to extreme densities for a nanosecond to ignite fusion.'}
        </p>
      </div>
    </div>
  );
};

export default FusionScene;