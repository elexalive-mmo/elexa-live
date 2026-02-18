import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
// COMMUNITY SPHERE — The Living Metaverse Hub
// Soul Core + Orbital Members + 100-Tile World Grid
// ═══════════════════════════════════════════════════════════════

// Realm definitions (synced with Tap2Earn realms)
const REALMS = {
    trench: { name: 'Trench Lowlands', tiles: [0, 19], color: new THREE.Color('#22c55e'), emissive: '#064e3b', label: 'Village' },
    ignis: { name: 'Ignis Peaks', tiles: [20, 39], color: new THREE.Color('#f97316'), emissive: '#431407', label: 'Outpost' },
    winds: { name: 'Azure Glades', tiles: [40, 59], color: new THREE.Color('#a855f7'), emissive: '#3b0764', label: 'Hub' },
    frost: { name: 'Crystal Spire', tiles: [60, 79], color: new THREE.Color('#38bdf8'), emissive: '#082f49', label: 'Citadel' },
    radiant: { name: 'Radiant Summit', tiles: [80, 99], color: new THREE.Color('#fbbf24'), emissive: '#451a03', label: 'Metropolis' },
};

function getRealmForTile(tileId) {
    for (const [key, realm] of Object.entries(REALMS)) {
        if (tileId >= realm.tiles[0] && tileId <= realm.tiles[1]) return { key, ...realm };
    }
    return { key: 'trench', ...REALMS.trench };
}

// ── Dynamic Scaling ──
function calculateScale(memberCount) {
    return Math.max(0.6, 1.0 - (memberCount - 5) * 0.01);
}

// ── Member Orbit (existing, preserved) ──
function MemberOrbit({ member, index, total, maxExp, scale }) {
    const meshRef = useRef();
    const angle = (index / total) * Math.PI * 2;
    const baseRadius = (1.8 + (index % 3) * 0.3) * scale;
    const speed = 0.06 + (index * 0.012);
    const expRatio = maxExp > 0 ? member.exp / maxExp : 0;
    const dotSize = (0.05 + (expRatio * 0.13)) * scale;
    const isActive = member.exp > 0;

    useFrame((state) => {
        const time = state.clock.elapsedTime * speed;
        meshRef.current.position.x = Math.cos(angle + time) * baseRadius;
        meshRef.current.position.z = Math.sin(angle + time) * baseRadius;
        meshRef.current.position.y = Math.sin(time * 0.4 + index) * 0.2 * scale;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * (isActive ? 0.12 : 0.04));
    });

    return (
        <group ref={meshRef}>
            <Sphere args={[dotSize, 16, 16]}>
                <meshStandardMaterial
                    color={isActive ? '#bf5af2' : '#64d2ff'}
                    emissive={isActive ? '#bf5af2' : '#64d2ff'}
                    emissiveIntensity={isActive ? 0.7 : 0.3}
                />
            </Sphere>
            <Html distanceFactor={6 / scale} position={[0, dotSize + 0.12, 0]} center>
                <div className="pointer-events-none" style={{
                    fontSize: 10 * scale + 4, fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap',
                    textShadow: '0 2px 10px rgba(0,0,0,0.9)', textAlign: 'center'
                }}>
                    {member.username}
                    {member.exp > 0 && (
                        <div style={{ fontSize: 8 * scale + 2, color: '#bf5af2', marginTop: 1 }}>
                            {member.exp} EXP
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
}

// ── Soul Core (existing, preserved) ──
function SoulCore({ isOperating }) {
    const coreRef = useRef();
    const innerRef = useRef();
    const pulseRefs = useRef([]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        coreRef.current.rotation.y = time * 0.2;
        coreRef.current.rotation.x = Math.sin(time * 0.1) * 0.15;
        const intensity = isOperating ? 0.15 : 0.05;
        const speed = isOperating ? 3 : 1;
        innerRef.current.scale.setScalar(1 + Math.sin(time * speed) * intensity);

        pulseRefs.current.forEach((ref, i) => {
            if (ref) {
                const phaseOffset = (i * Math.PI) / 3;
                const pulsePhase = (time * 2 + phaseOffset) % (Math.PI * 2);
                ref.scale.setScalar(1 + pulsePhase / 3);
                ref.material.opacity = Math.max(0, 1 - pulsePhase / (Math.PI * 2)) * (isOperating ? 0.4 : 0.1);
            }
        });
    });

    return (
        <group ref={coreRef}>
            <Sphere ref={innerRef} args={[0.6, 64, 64]}>
                <meshStandardMaterial
                    color="#1a1a2e" metalness={0.95} roughness={0.05}
                    emissive={isOperating ? '#bf5af2' : '#6b21a8'}
                    emissiveIntensity={isOperating ? 0.8 : 0.3}
                />
            </Sphere>
            <Sphere args={[0.75, 32, 32]}>
                <meshBasicMaterial color="#bf5af2" transparent opacity={isOperating ? 0.15 : 0.05} />
            </Sphere>
            {[0, 1, 2].map((i) => (
                <Sphere key={i} ref={(el) => (pulseRefs.current[i] = el)} args={[0.8, 32, 32]}>
                    <meshBasicMaterial color="#bf5af2" transparent opacity={0.1} />
                </Sphere>
            ))}
        </group>
    );
}

// ── Orbital Rings (existing, preserved) ──
function OrbitalRings({ scale, memberCount }) {
    const ringCount = Math.min(5, Math.ceil(memberCount / 3)) || 3;
    const rings = useMemo(() => {
        return Array.from({ length: ringCount }, (_, i) => ({
            radius: (1.8 + i * 0.3) * scale,
            color: i % 2 === 0 ? '#bf5af2' : '#64d2ff',
            opacity: 0.12 - (i * 0.02)
        }));
    }, [scale, ringCount]);

    return (
        <group>
            {rings.map((ring, i) => (
                <Ring key={i} radius={ring.radius} color={ring.color} opacity={ring.opacity} />
            ))}
        </group>
    );
}

function Ring({ radius, color, opacity }) {
    const geometry = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        }
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [radius]);

    return (
        <line geometry={geometry}>
            <lineBasicMaterial color={color} opacity={opacity} transparent />
        </line>
    );
}

// ── Urbanization Structure ──
function Structure({ height, color, isDungeon }) {
    if (height <= 0 && !isDungeon) return null;

    return (
        <group position={[0, 0.05 + height / 2, 0]}>
            <mesh>
                <boxGeometry args={[0.2, height, 0.2]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
            </mesh>
            {isDungeon && (
                <mesh position={[0, height / 2 + 0.1, 0]}>
                    <coneGeometry args={[0.15, 0.3, 4]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" />
                </mesh>
            )}
        </group>
    );
}

// ════════════════════════════════════════════════════════════
// NEW: WORLD TILE GRID — 10×10 Grid orbiting below the core
// ════════════════════════════════════════════════════════════

function WorldTile({ tileId, x, z, isActive, isVisited, realm, urbanizationLevel = 0, onClick }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const baseY = -3;
            const hover = hovered ? 0.15 : 0;
            const active = isActive ? 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.05 : 0;
            meshRef.current.position.y = baseY + hover + active;
        }
    });

    const isBossTile = tileId > 0 && (tileId % 10 === 0 || tileId <= 10);
    const structHeight = isBossTile ? 0.3 : (Math.random() * 0.1 + (urbanizationLevel * 0.05));

    const color = isActive
        ? (realm.color instanceof THREE.Color ? realm.color : new THREE.Color(realm.color || '#22c55e'))
        : isVisited
            ? (realm.color instanceof THREE.Color ? realm.color.clone().multiplyScalar(0.4) : new THREE.Color('#1a1a2e'))
            : new THREE.Color('#1a1a2e');

    return (
        <group position={[x, -3, z]}>
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick?.(tileId); }}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
            >
                <boxGeometry args={[0.42, 0.08, 0.42]} />
                <meshStandardMaterial
                    color={color}
                    emissive={isActive ? realm.color : (hovered ? '#333355' : '#0a0a1a')}
                    emissiveIntensity={isActive ? 0.9 : (hovered ? 0.5 : 0.1)}
                    metalness={0.6}
                    roughness={0.3}
                />

                {/* Visual Urbanization */}
                <Structure height={structHeight} color={color} isDungeon={isBossTile} />

                {/* Boss marker */}
                {isBossTile && (
                    <Html distanceFactor={8} position={[0, structHeight + 0.5, 0]} center>
                        <span style={{ fontSize: 12, filter: 'drop-shadow(0 0 4px red)' }}>⚔️</span>
                    </Html>
                )}
                {/* Active tile glow */}
                {isActive && (
                    <Html distanceFactor={8} position={[0, 1.2, 0]} center>
                        <div style={{
                            fontSize: 8, color: 'white', fontWeight: 700,
                            textShadow: '0 0 8px rgba(168,85,247,0.8)',
                            whiteSpace: 'nowrap',
                            background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px'
                        }}>
                            {realm.label}: T{tileId}
                        </div>
                    </Html>
                )}
            </mesh>
        </group>
    );
}

function WorldGrid({ currentTile = 1, urbanizationLevel = 0, onTileClick }) {
    const gridRef = useRef();
    const gridSize = 10;
    const spacing = 0.5;
    const offset = (gridSize * spacing) / 2 - spacing / 2;

    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.rotation.y = state.clock.elapsedTime * 0.03;
        }
    });

    const tiles = useMemo(() => {
        const arr = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const id = row * gridSize + col;
                arr.push({
                    id,
                    x: col * spacing - offset,
                    z: row * spacing - offset,
                    realm: getRealmForTile(id)
                });
            }
        }
        return arr;
    }, []);

    const activeRealm = getRealmForTile(currentTile);

    return (
        <group ref={gridRef}>
            {/* Realm label */}
            <Html distanceFactor={10} position={[0, -2.4, 0]} center>
                <div style={{
                    fontSize: 11, color: activeRealm.color.getStyle(), fontWeight: 800,
                    textShadow: '0 0 10px rgba(0,0,0,0.8)',
                    letterSpacing: 2, textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '20px',
                    border: `1px solid ${activeRealm.color.getStyle()}`
                }}>
                    🗺️ {activeRealm.name} ({activeRealm.label})
                </div>
            </Html>

            {tiles.map((t) => (
                <WorldTile
                    key={t.id}
                    tileId={t.id}
                    x={t.x}
                    z={t.z}
                    isActive={t.id === currentTile}
                    isVisited={t.id < currentTile}
                    realm={t.realm}
                    urbanizationLevel={urbanizationLevel}
                    onClick={onTileClick}
                />
            ))}
        </group>
    );
}

// ── Player Avatar (simple for now, GLTF later) ──
// ── Player Role Aura ──
function RoleAura({ role }) {
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.02;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    const config = {
        Tank: { color: '#60a5fa', geometry: <torusGeometry args={[0.25, 0.02, 16, 32]} /> },
        Healer: { color: '#4ade80', geometry: <torusGeometry args={[0.22, 0.015, 12, 24]} />, particles: true },
        DPS: { color: '#f87171', geometry: <octahedronGeometry args={[0.15]} /> },
        Support: { color: '#a78bfa', geometry: <icosahedronGeometry args={[0.18]} /> }
    };

    const style = config[role] || config.Tank;

    return (
        <group position={[0, 0.2, 0]}>
            <mesh ref={meshRef}>
                {style.geometry}
                <meshStandardMaterial
                    color={style.color}
                    emissive={style.color}
                    emissiveIntensity={2}
                    transparent
                    opacity={0.6}
                />
            </mesh>
            <pointLight distance={1} intensity={2} color={style.color} />
        </group>
    );
}

function PlayerAvatar({ position, userStats = {} }) {
    const group = useRef();
    const role = userStats?.mmoRole || 'Tank';

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.015;
            group.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.001;
        }
    });

    return (
        <group ref={group} position={position}>
            <RoleAura role={role} />
            <mesh position={[0, 0, 0]}>
                <octahedronGeometry args={[0.12, 0]} />
                <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={0.8}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
                <boxGeometry args={[0.08, 0.2, 0.08]} />
                <meshStandardMaterial color="#3b0764" metalness={1} roughness={0.2} />
            </mesh>
            {/* Label */}
            <Html distanceFactor={8} position={[0, 0.45, 0]} center>
                <div style={{
                    fontSize: 9, color: '#fbbf24', fontWeight: 700,
                    textShadow: '0 0 6px rgba(251,191,36,0.6)',
                    whiteSpace: 'nowrap'
                }}>
                    👑 YOU ({role})
                </div>
            </Html>
        </group>
    );
}

// ════════════════════════════════════════════════════════════
// MAIN: CommunitySphere3D — The Metaverse Hub
// ════════════════════════════════════════════════════════════

// ── Floating Combat Text ──
function FloatingText({ text, position, color = '#ef4444', onComplete }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <Html position={[position[0], position[1] + 0.5, position[2]]} center distanceFactor={8}>
            <motion.div
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{ y: -80, opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="font-black italic pointer-events-none select-none drop-shadow-lg"
                style={{ color, fontSize: 14, whiteSpace: 'nowrap' }}
            >
                {text}
            </motion.div>
        </Html>
    );
}

export function CommunitySphere3D({ members = [], isOperating = false, userStats = {} }) {
    const maxExp = Math.max(...members.map(m => m.exp), 1);
    const scale = calculateScale(members.length);
    const [currentTile, setCurrentTile] = useState(userStats?.tile || 1);
    const [viewMode, setViewMode] = useState('sphere'); // 'sphere' or 'world'
    const [floatingTexts, setFloatingTexts] = useState([]);

    const addFloatingText = useCallback((text, pos, color) => {
        const id = Math.random();
        setFloatingTexts(prev => [...prev, { id, text, pos, color }]);
    }, []);

    const handleTileClick = useCallback(async (tileId) => {
        setCurrentTile(tileId);
        try {
            const res = await fetch('http://localhost:3020/api/action/tap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userStats?.username || 'guest', targetTile: tileId })
            });
            const data = await res.json();

            if (data.user?.world?.activeBoss) {
                // If we hit a boss, trigger FCT
                const bossPos = [0, -2.5, 0]; // Relative to grid or absolute? Let's use avatar pos
                addFloatingText(`-${data.lastDmg || 5}`, [0, 0, 0], '#ef4444');
            }
        } catch (e) {
            console.warn('[Sphere] Action failed — offline mode');
        }
    }, [userStats?.username, addFloatingText]);

    // ... (avatar calculation remains same) ...
    const gridSize = 10;
    const spacing = 0.5;
    const offset = (gridSize * spacing) / 2 - spacing / 2;
    const avatarX = (currentTile % gridSize) * spacing - offset;
    const avatarZ = Math.floor(currentTile / gridSize) * spacing - offset;

    return (
        <div className="fixed inset-0 z-0">
            {/* View Mode Toggle */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={() => setViewMode('sphere')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${viewMode === 'sphere'
                        ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                        : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'
                        }`}
                >
                    🌐 Soul Core
                </button>
                <button
                    onClick={() => setViewMode('world')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${viewMode === 'world'
                        ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                        : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'
                        }`}
                >
                    🗺️ World Map
                </button>
            </div>

            <Canvas camera={{
                position: viewMode === 'world' ? [0, 6, 5] : [0, 1.2, 4],
                fov: viewMode === 'world' ? 60 : 50
            }}>
                <ambientLight intensity={0.35} />
                <pointLight position={[4, 4, 4]} intensity={1.5} color="#bf5af2" />
                <pointLight position={[-4, -2, 4]} intensity={0.7} color="#64d2ff" />
                <pointLight position={[0, 0, 0]} intensity={0.5} color="#bf5af2" />

                {/* Starfield */}
                <Stars radius={100} depth={50} count={2000} factor={3} saturation={0.5} fade speed={0.5} />

                {/* Soul Core — always present */}
                <SoulCore isOperating={isOperating || viewMode === 'world'} />

                {/* Orbital members — soul core mode */}
                {viewMode === 'sphere' && (
                    <>
                        <OrbitalRings scale={scale} memberCount={members.length} />
                        {members.map((member, i) => (
                            <MemberOrbit
                                key={member.username}
                                member={member}
                                index={i}
                                total={members.length}
                                maxExp={maxExp}
                                scale={scale}
                            />
                        ))}
                    </>
                )}

                {/* World Grid — world map mode */}
                {viewMode === 'world' && (
                    <group>
                        <WorldGrid
                            currentTile={currentTile}
                            urbanizationLevel={userStats?.world?.urbanizationLevel || 0}
                            onTileClick={handleTileClick}
                        />
                        <PlayerAvatar
                            position={[avatarX, -2.7, avatarZ]}
                            userStats={userStats}
                        />

                        {/* FCT Layer within the grid context */}
                        {floatingTexts.map(fct => (
                            <FloatingText
                                key={fct.id}
                                text={fct.text}
                                color={fct.color}
                                position={[avatarX, -2.5, avatarZ]}
                                onComplete={() => setFloatingTexts(prev => prev.filter(t => t.id !== fct.id))}
                            />
                        ))}
                    </group>
                )}

                <OrbitControls
                    enableZoom={true}
                    enablePan={viewMode === 'world'}
                    autoRotate={viewMode === 'sphere'}
                    autoRotateSpeed={0.25}
                    minDistance={viewMode === 'world' ? 3 : 2}
                    maxDistance={viewMode === 'world' ? 15 : 12}
                    minPolarAngle={viewMode === 'world' ? 0.3 : Math.PI / 5}
                    maxPolarAngle={viewMode === 'world' ? Math.PI / 2.5 : Math.PI / 1.3}
                    target={viewMode === 'world' ? [0, -3, 0] : [0, 0, 0]}
                />
            </Canvas>
        </div>
    );
}
