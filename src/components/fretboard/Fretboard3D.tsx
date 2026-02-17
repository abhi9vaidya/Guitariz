/**
 * Fretboard3D — A realistic 3D guitar fretboard rendered with React Three Fiber.
 *
 * Sub-components:
 *   GuitarNeck      – the rosewood body
 *   FretWires       – 12 nickel-silver fret wires (instanced)
 *   GuitarStrings   – 6 steel strings with varying thickness
 *   FretInlays      – mother-of-pearl dot inlays at 3,5,7,9,12
 *   NoteMarkers     – glowing spheres at highlighted positions
 *   NutAndBridge    – nut at fret 0, saddle at end
 *   SceneLighting   – 3-point lighting setup
 */

import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────
const NOTES = ["E", "A", "D", "G", "B", "E"];
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NUM_FRETS = 12;
const MARKER_FRETS = [3, 5, 7, 9];
const DOUBLE_MARKER_FRET = 12;

// Neck dimensions (Three.js units ≈ abstract, tuned for visual quality)
const NECK_LENGTH = 8;
const NECK_WIDTH_NUT = 1.1;
const NECK_WIDTH_BRIDGE = 1.5;
const NECK_THICKNESS = 0.18;

// String positions
const STRING_Y_OFFSET = NECK_THICKNESS / 2 + 0.015; // Sit just above the neck surface
const STRING_RADIUS_LOW = 0.014;
const STRING_RADIUS_HIGH = 0.006;

// ─── Types ────────────────────────────────────────────────────────────
export interface FretNote {
    string: number;
    fret: number;
    note: string;
}

interface Fretboard3DProps {
    highlightedNotes: FretNote[];
    scaleContext?: {
        enabled: boolean;
        rootIndex: number;
        pcs: Set<number>;
    };
    onNoteClick?: (stringIndex: number, fret: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function getFretX(fret: number): number {
    // Fret 0 (nut) is at -NECK_LENGTH/2, fret 12 is at +NECK_LENGTH/2
    return -NECK_LENGTH / 2 + (fret / NUM_FRETS) * NECK_LENGTH;
}

function getStringZ(stringIndex: number): number {
    // String 0 (low E) at one edge, string 5 (high E) at the other
    const totalWidth = NECK_WIDTH_NUT * 0.7; // strings are ~70% of neck width
    return -totalWidth / 2 + (stringIndex / (NOTES.length - 1)) * totalWidth;
}

function getNoteAtFret(stringIndex: number, fret: number): string {
    const openNote = NOTES[stringIndex];
    const openNoteIndex = CHROMATIC.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    return CHROMATIC[noteIndex];
}

function getNoteColor(note: string): string {
    const colors: Record<string, string> = {
        "C": "#ff6b6b", "C#": "#ee5a24", "D": "#feca57", "D#": "#ff9ff3",
        "E": "#48dbfb", "F": "#ff6348", "F#": "#1dd1a1", "G": "#54a0ff",
        "G#": "#5f27cd", "A": "#ff9f43", "A#": "#c44569", "B": "#2ed573",
    };
    return colors[note] || "#ffffff";
}

// ─── Guitar Neck ──────────────────────────────────────────────────────
function GuitarNeck() {
    const geometry = useMemo(() => {
        // Create a tapered box using custom geometry
        const shape = new THREE.Shape();
        const hw0 = NECK_WIDTH_NUT / 2;
        const hw1 = NECK_WIDTH_BRIDGE / 2;

        // Neck outline (XZ plane at y=0, then extrude in Y)
        shape.moveTo(-NECK_LENGTH / 2, -hw0);
        shape.lineTo(NECK_LENGTH / 2, -hw1);
        shape.lineTo(NECK_LENGTH / 2, hw1);
        shape.lineTo(-NECK_LENGTH / 2, hw0);
        shape.closePath();

        const extrudeSettings = {
            depth: NECK_THICKNESS,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 3,
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Rotate so the neck lies flat (extrude goes in Z, we want it in Y)
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -NECK_THICKNESS / 2, 0);
        return geo;
    }, []);

    return (
        <mesh geometry={geometry} receiveShadow castShadow>
            <meshStandardMaterial
                color="#3a2218"
                roughness={0.85}
                metalness={0.05}
                envMapIntensity={0.3}
            />
        </mesh>
    );
}

// ─── Fretboard Surface (rosewood overlay) ──────────────────────────────
function FretboardSurface() {
    const geometry = useMemo(() => {
        // Slightly wider than the neck at each end to create a realistic look
        const vertices = new Float32Array([
            // Quad 1 (triangle 1)
            -NECK_LENGTH / 2, NECK_THICKNESS / 2 + 0.001, -NECK_WIDTH_NUT / 2,
            NECK_LENGTH / 2, NECK_THICKNESS / 2 + 0.001, -NECK_WIDTH_BRIDGE / 2,
            NECK_LENGTH / 2, NECK_THICKNESS / 2 + 0.001, NECK_WIDTH_BRIDGE / 2,
            // Quad 1 (triangle 2)
            -NECK_LENGTH / 2, NECK_THICKNESS / 2 + 0.001, -NECK_WIDTH_NUT / 2,
            NECK_LENGTH / 2, NECK_THICKNESS / 2 + 0.001, NECK_WIDTH_BRIDGE / 2,
            -NECK_LENGTH / 2, NECK_THICKNESS / 2 + 0.001, NECK_WIDTH_NUT / 2,
        ]);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh geometry={geometry} receiveShadow>
            <meshStandardMaterial
                color="#2a1810"
                roughness={0.7}
                metalness={0.08}
                envMapIntensity={0.4}
            />
        </mesh>
    );
}

// ─── Fret Wires ───────────────────────────────────────────────────────
function FretWires() {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const [geometry, material] = useMemo(() => {
        const geo = new THREE.BoxGeometry(0.025, 0.04, NECK_WIDTH_BRIDGE);
        const mat = new THREE.MeshStandardMaterial({
            color: "#d4d4d4",
            metalness: 0.95,
            roughness: 0.15,
            envMapIntensity: 1.2,
        });
        return [geo, mat];
    }, []);

    useEffect(() => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        for (let i = 1; i <= NUM_FRETS; i++) {
            const x = getFretX(i);
            dummy.position.set(x, NECK_THICKNESS / 2 + 0.02, 0);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i - 1, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, []);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, NUM_FRETS]}
            castShadow
        />
    );
}

// ─── Nut (at fret 0) ─────────────────────────────────────────────────
function Nut() {
    return (
        <mesh
            position={[getFretX(0), NECK_THICKNESS / 2 + 0.025, 0]}
            castShadow
        >
            <boxGeometry args={[0.06, 0.05, NECK_WIDTH_NUT * 0.85]} />
            <meshStandardMaterial
                color="#f5f0e8"
                roughness={0.4}
                metalness={0.1}
                envMapIntensity={0.5}
            />
        </mesh>
    );
}

// ─── Guitar Strings ───────────────────────────────────────────────────
function GuitarStrings() {
    const strings = useMemo(() => {
        return NOTES.map((_, i) => {
            const t = i / (NOTES.length - 1);
            const radius = STRING_RADIUS_LOW + (STRING_RADIUS_HIGH - STRING_RADIUS_LOW) * t;
            const z = getStringZ(i);
            return { index: i, radius, z };
        });
    }, []);

    return (
        <group>
            {strings.map((s) => (
                <mesh
                    key={s.index}
                    position={[0, STRING_Y_OFFSET, s.z]}
                    rotation={[0, 0, Math.PI / 2]}
                    castShadow
                >
                    <cylinderGeometry args={[s.radius, s.radius, NECK_LENGTH, 8]} />
                    <meshPhysicalMaterial
                        color={s.index < 3 ? "#c8b890" : "#e8e0d0"}
                        metalness={1}
                        roughness={s.index < 3 ? 0.35 : 0.2}
                        clearcoat={0.3}
                        clearcoatRoughness={0.2}
                        envMapIntensity={1.5}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Fret Inlays ──────────────────────────────────────────────────────
function FretInlays() {
    const inlays = useMemo(() => {
        const positions: { x: number; z: number }[] = [];

        // Single dot inlays at frets 3, 5, 7, 9
        for (const fret of MARKER_FRETS) {
            const x = (getFretX(fret) + getFretX(fret - 1)) / 2; // center of fret space
            positions.push({ x, z: 0 });
        }

        // Double dot at fret 12
        const x12 = (getFretX(DOUBLE_MARKER_FRET) + getFretX(DOUBLE_MARKER_FRET - 1)) / 2;
        positions.push({ x: x12, z: 0.2 });
        positions.push({ x: x12, z: -0.2 });

        return positions;
    }, []);

    return (
        <group>
            {inlays.map((pos, i) => (
                <mesh
                    key={i}
                    position={[pos.x, NECK_THICKNESS / 2 + 0.003, pos.z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <circleGeometry args={[0.05, 16]} />
                    <meshStandardMaterial
                        color="#e8ddd0"
                        roughness={0.3}
                        metalness={0.3}
                        envMapIntensity={0.8}
                        emissive="#e8ddd0"
                        emissiveIntensity={0.05}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Note Markers (highlighted notes) ─────────────────────────────────
function NoteMarkers({
    highlightedNotes,
    onNoteClick,
}: {
    highlightedNotes: FretNote[];
    onNoteClick?: (stringIndex: number, fret: number) => void;
}) {
    return (
        <group>
            {highlightedNotes.map((note, i) => {
                const fretCenter = note.fret === 0
                    ? getFretX(0) + 0.15
                    : (getFretX(note.fret) + getFretX(note.fret - 1)) / 2;
                const z = getStringZ(note.string);
                const color = getNoteColor(note.note);

                return (
                    <NoteMarker
                        key={`${note.string}-${note.fret}-${i}`}
                        position={[fretCenter, STRING_Y_OFFSET + 0.04, z]}
                        color={color}

                        onClick={() => onNoteClick?.(note.string, note.fret)}
                    />
                );
            })}
        </group>
    );
}

function NoteMarker({
    position,
    color,
    onClick,
}: {
    position: [number, number, number];
    color: string;
    onClick?: () => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    // Gentle floating animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.008;
        }
        if (glowRef.current) {
            glowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.008;
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.15;
            glowRef.current.scale.setScalar(scale);
        }
        state.invalidate(); // Request re-render for demand-mode frameloop
    });

    return (
        <group>
            {/* Glow effect */}
            <mesh ref={glowRef} position={position}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.25}
                />
            </mesh>

            {/* Main sphere */}
            <mesh
                ref={meshRef}
                position={position}
                castShadow
                onClick={onClick}
            >
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshPhysicalMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.6}
                    roughness={0.2}
                    metalness={0.4}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    envMapIntensity={1}
                />
            </mesh>
        </group>
    );
}

// ─── Clickable Fret Zones (invisible, for interaction) ────────────────
function ClickableZones({
    onNoteClick,
}: {
    onNoteClick?: (stringIndex: number, fret: number) => void;
}) {
    const zones = useMemo(() => {
        const result: { stringIndex: number; fret: number; x: number; z: number }[] = [];
        for (let s = 0; s < NOTES.length; s++) {
            for (let f = 0; f <= NUM_FRETS; f++) {
                const x = f === 0
                    ? getFretX(0) + 0.15
                    : (getFretX(f) + getFretX(f - 1)) / 2;
                const z = getStringZ(s);
                result.push({ stringIndex: s, fret: f, x, z });
            }
        }
        return result;
    }, []);

    return (
        <group>
            {zones.map((zone) => (
                <mesh
                    key={`${zone.stringIndex}-${zone.fret}`}
                    position={[zone.x, STRING_Y_OFFSET + 0.01, zone.z]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onNoteClick?.(zone.stringIndex, zone.fret);
                    }}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = "auto";
                    }}
                >
                    <boxGeometry args={[NECK_LENGTH / (NUM_FRETS + 1) * 0.8, 0.04, 0.12]} />
                    <meshBasicMaterial transparent opacity={0} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Scale overlay dots (subtle, non-highlighted scale notes) ─────────
function ScaleOverlay({
    scaleContext,
    highlightedNotes,
}: {
    scaleContext?: { enabled: boolean; rootIndex: number; pcs: Set<number> };
    highlightedNotes: FretNote[];
}) {
    const dots = useMemo(() => {
        if (!scaleContext?.enabled) return [];
        const result: { x: number; z: number; isRoot: boolean }[] = [];
        const highlightedSet = new Set(highlightedNotes.map(n => `${n.string}-${n.fret}`));

        for (let s = 0; s < NOTES.length; s++) {
            for (let f = 0; f <= NUM_FRETS; f++) {
                if (highlightedSet.has(`${s}-${f}`)) continue; // skip already highlighted
                const note = getNoteAtFret(s, f);
                const noteIndex = CHROMATIC.indexOf(note);
                if (scaleContext.pcs.has(noteIndex)) {
                    const x = f === 0
                        ? getFretX(0) + 0.15
                        : (getFretX(f) + getFretX(f - 1)) / 2;
                    const z = getStringZ(s);
                    result.push({ x, z, isRoot: noteIndex === scaleContext.rootIndex });
                }
            }
        }
        return result;
    }, [scaleContext, highlightedNotes]);

    if (dots.length === 0) return null;

    return (
        <group>
            {dots.map((dot, i) => (
                <mesh
                    key={i}
                    position={[dot.x, STRING_Y_OFFSET + 0.025, dot.z]}
                >
                    <sphereGeometry args={[0.025, 8, 8]} />
                    <meshStandardMaterial
                        color={dot.isRoot ? "#ff6b6b" : "#ffffff"}
                        transparent
                        opacity={dot.isRoot ? 0.5 : 0.2}
                        roughness={0.5}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Scene Lighting ───────────────────────────────────────────────────
function SceneLighting() {
    return (
        <>
            <ambientLight intensity={0.5} color="#e0d4c8" />
            {/* Key light — warm, from above-right */}
            <directionalLight
                position={[5, 8, 3]}
                intensity={1.5}
                color="#fff5e6"
                castShadow
            />
            {/* Fill light — cool, from left */}
            <directionalLight
                position={[-4, 4, -2]}
                intensity={0.6}
                color="#c8d8f0"
            />
            {/* Rim light — from behind, subtle */}
            <pointLight
                position={[0, 3, -4]}
                intensity={0.4}
                color="#ffffff"
                distance={15}
            />
            {/* Bottom fill for neck underside */}
            <directionalLight
                position={[0, -3, 2]}
                intensity={0.2}
                color="#a0b0c0"
            />
            {/* Front highlight for metallic sheen on strings */}
            <spotLight
                position={[0, 6, 6]}
                angle={0.4}
                penumbra={0.8}
                intensity={0.8}
                color="#ffffff"
            />
        </>
    );
}

// ─── Fret Numbers ─────────────────────────────────────────────────────
function FretNumbers() {
    const labels = useMemo(() => {
        const result: { fret: number; x: number }[] = [];
        for (let f = 1; f <= NUM_FRETS; f++) {
            const x = (getFretX(f) + getFretX(f - 1)) / 2;
            result.push({ fret: f, x });
        }
        return result;
    }, []);

    return (
        <group>
            {labels.map((l) => (
                <mesh
                    key={l.fret}
                    position={[l.x, -NECK_THICKNESS / 2 - 0.05, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <circleGeometry args={[0.08, 12]} />
                    <meshBasicMaterial
                        color={[3, 5, 7, 9, 12].includes(l.fret) ? "#ffffff" : "#666666"}
                        transparent
                        opacity={[3, 5, 7, 9, 12].includes(l.fret) ? 0.4 : 0.15}
                    />
                </mesh>
            ))}
        </group>
    );
}

// ─── Main Exported Component ──────────────────────────────────────────
export default function Fretboard3D({
    highlightedNotes,
    scaleContext,
    onNoteClick,
}: Fretboard3DProps) {
    return (
        <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-black/40 border border-white/5">
            <Canvas
                shadows
                frameloop="demand"
                dpr={[1, 1.5]}
                camera={{
                    position: [0, 4, 5],
                    fov: 40,
                    near: 0.1,
                    far: 50,
                }}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
                onCreated={(state) => {
                    state.gl.setClearColor("#0a0a0a", 1);
                }}
            >
                <SceneLighting />

                <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
                    <GuitarNeck />
                    <FretboardSurface />
                    <FretWires />
                    <Nut />
                    <GuitarStrings />
                    <FretInlays />
                    <FretNumbers />
                    <NoteMarkers highlightedNotes={highlightedNotes} onNoteClick={onNoteClick} />
                    <ScaleOverlay scaleContext={scaleContext} highlightedNotes={highlightedNotes} />
                    <ClickableZones onNoteClick={onNoteClick} />
                </group>

                <OrbitControls
                    makeDefault
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={3}
                    maxDistance={12}
                    autoRotate={false}
                    dampingFactor={0.05}
                    enableDamping={true}
                />
            </Canvas>
        </div>
    );
}
