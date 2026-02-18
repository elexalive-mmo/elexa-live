import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, ContactShadows, Stars, Environment, PresentationControls, Sparkles, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 🌕 The Aetheric Pedestal for Elexamon
const ElexamonPedestal = ({ position = [0, -1, 0] }) => {
    return (
        <group position={position}>
            {/* Base Disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[2, 32]} />
                <meshStandardMaterial color="#0a0a0f" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Inner Glow Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[1.8, 1.9, 64]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.8} />
            </mesh>

            {/* Pulsing Core Light */}
            <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere args={[0.3, 16, 16]} position={[0, 0.5, 0]}>
                    <meshBasicMaterial color="#ec4899" />
                    <pointLight color="#ec4899" intensity={4} distance={8} />
                </Sphere>
            </Float>

            <Sparkles count={50} scale={3} size={2} speed={0.5} opacity={0.2} color="#a855f7" />
        </group>
    );
};

// 🐾 Stylized 3D Elexamon (Reactive Meta-Pet)
const Elexamon3D = ({ mood = 'happy' }) => {
    const groupRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.position.y = 1.2 + Math.sin(t * 1.5) * 0.15;
            groupRef.current.rotation.y = t * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh castShadow>
                    <icosahedronGeometry args={[0.6, 15]} />
                    {mood === 'happy' ? (
                        <MeshDistortMaterial
                            color="#f97316"
                            speed={4}
                            distort={0.3}
                            radius={1}
                            metalness={0.5}
                            roughness={0.2}
                            emissive="#f97316"
                            emissiveIntensity={0.4}
                        />
                    ) : (
                        <MeshWobbleMaterial
                            color="#3b82f6"
                            factor={1}
                            speed={2}
                            metalness={0.8}
                            roughness={0.1}
                            emissive="#3b82f6"
                            emissiveIntensity={0.3}
                        />
                    )}
                </mesh>
            </Float>

            {/* Eyes of Power */}
            <mesh position={[0.2, 0.1, 0.45]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="white" />
            </mesh>
            <mesh position={[-0.2, 0.1, 0.45]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Halo */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}>
                <ringGeometry args={[0.7, 0.72, 64]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

// 🌌 The Backdrop Elements
const SanctumEnvironment = () => {
    return (
        <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" />
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        </>
    );
};

export const SanctumViewport = ({ userStats, sanctumConfig }) => {
    return (
        <div className="w-full h-full bg-[#050505]">
            <Canvas
                shadows
                camera={{ position: [0, 2, 8], fov: 45 }}
                gl={{ antialias: true }}
            >
                <SanctumEnvironment />

                <PresentationControls
                    global
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                    <group position={[0, -1, 0]}>
                        <ElexamonPedestal />
                        <Elexamon3D mood={sanctumConfig?.mood} />

                        {/* Ground Shadows */}
                        <ContactShadows
                            position={[0, 0, 0]}
                            opacity={0.4}
                            scale={10}
                            blur={2}
                            far={4.5}
                        />
                    </group>
                </PresentationControls>

                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
};
