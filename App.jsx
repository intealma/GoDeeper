import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture, RoundedBox } from '@react-three/drei'
import { useRef, useState, useEffect, useMemo } from 'react'
import { Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Text } from '@react-three/drei'

const layers = [
  "Application",
  "Presentation",
  "Session",
  "Transport",
  "Network",
  "Data Link",
  "Physical"
]


function DustParticles() {
  const pointsRef = useRef()

  const particles = useMemo(() => {
    const count = 50
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2     // x
      positions[i * 3 + 1] = Math.random() * +5       // y (nedåt)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2 // z
    }

    return positions
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.05
    }
  })

  return (
    <points ref={pointsRef} position={[0, 6.5, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#f6dc87"
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  )
}

function HangingLamp() {
  const lampRef = useRef()
  const lightRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // subtle sway
    if (lampRef.current) {
      lampRef.current.rotation.z = Math.sin(t * 0.8) * 0.1
    }

    // flicker
    if (lightRef.current) {
      lightRef.current.intensity = 18 + Math.sin(t * 20) * 2
    }
  })

  return (
    <group ref={lampRef} position={[0, 7, 0]}>

      {/* Sladd */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Lampskärm */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.6, 1.2, 32]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Glödlampa */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          emissive="#ffaa33"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Ljuset */}
      <spotLight
        ref={lightRef}
        position={[0, -0.4, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={50}
        distance={15}
        color="#ffaa33"
        castShadow
      />
    </group>
  )
}


function LetterModel({ position, onClick, floating = false, scale = 1 }) {
  const { scene } = useGLTF('/models/letter.glb')
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return

    const t = state.clock.getElapsedTime()

    if (floating) {
      // subtil svävning
      ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.1
      
      // liten rotation
      ref.current.rotation.y += 0.003
    }
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={scale}
      rotation={[0, Math.PI / 4, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    />
  )
}

function TypewriterText() {
  const text = `
You think you are using the internet.
But are you really?

What actually happens when you type:
GoDeeper.com
and press enter?
  `

  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i))
      i++
      if (i > text.length) clearInterval(interval)
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: '40%',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '18px',
      whiteSpace: 'pre-line'
    }}>
      {displayed}
    </div>
  )
}

function IndustrialShelf({ setActiveLayer, setSelectedObject, activeLayer }) {

  // WOOD TEXTURES
  const woodColor = useTexture('/textures/wood/bark_willow_diff_4k.png')
  const woodNormal = useTexture('/textures/wood/bark_willow_nor_gl_4k.png')
  const woodRough = useTexture('/textures/wood/bark_willow_rough_4k.png')

  woodColor.colorSpace = THREE.SRGBColorSpace
  woodNormal.colorSpace = THREE.NoColorSpace
  woodRough.colorSpace = THREE.NoColorSpace

  woodColor.wrapS = woodColor.wrapT = THREE.RepeatWrapping
  woodColor.repeat.set(2, 1)

  woodNormal.wrapS = woodNormal.wrapT = THREE.RepeatWrapping
  woodNormal.repeat.set(2, 1)

  woodRough.wrapS = woodRough.wrapT = THREE.RepeatWrapping
  woodRough.repeat.set(2, 1)

  // METAL TEXTURES
  const metalColor = useTexture('/textures/metal/rust_coarse_01_diff_4k.png')
  const metalNormal = useTexture('/textures/metal/rust_coarse_01_nor_gl_4k.png')
  const metalRough = useTexture('/textures/metal/rust_coarse_01_rough_4k.png')

  metalColor.colorSpace = THREE.SRGBColorSpace
  metalNormal.colorSpace = THREE.NoColorSpace
  metalRough.colorSpace = THREE.NoColorSpace

  metalColor.wrapS = metalColor.wrapT = THREE.RepeatWrapping
  metalColor.repeat.set(1, 4)

  metalNormal.wrapS = metalNormal.wrapT = THREE.RepeatWrapping
  metalNormal.repeat.set(1, 4)

  metalRough.wrapS = metalRough.wrapT = THREE.RepeatWrapping
  metalRough.repeat.set(1, 4)

  // Subtle rough geometry for planks
  const plankGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(4, 0.35, 2, 20, 4, 20)
    const pos = geo.attributes.position

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)

      // only disturb top surface
      if (y > 0.15) {
        pos.setY(i, y + (Math.random() - 0.5) * 0.015)
      }
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group>

      {/* Vertical poles */}
      {[ -1.8, 1.8 ].map((x, i) =>
        [ -1, 1 ].map((z, j) => (
          <mesh key={`pole-${i}-${j}`} position={[x, 0, z]}>
            <cylinderGeometry args={[0.12, 0.12, 12, 32]} />
            <meshStandardMaterial
              map={metalColor}
              normalMap={metalNormal}
              roughnessMap={metalRough}
              metalness={0.7}
              roughness={1}
            />
          </mesh>
        ))
      )}

      {/* Shelf layers */}
      {layers.map((layer, index) => (
        <mesh
          key={layer}
          geometry={plankGeometry}
          position={[0, index * 1.5 - 4.5, 0]}
          onClick={() => setActiveLayer(index)}
        >
          <meshStandardMaterial
            map={woodColor}
            normalMap={woodNormal}
            roughnessMap={woodRough}
            metalness={0.05}
          />
        </mesh>
      ))}
      {/* Application Layer Object */}
      <LetterModel
  position={[0, 0 * 1.5 - 4.2, 0]}
  onClick={() => {
    if (activeLayer === 0) {
      setSelectedObject("letter")
    }
  }}
/>

    </group>
  )
}

export default function App() {
  const [activeLayer, setActiveLayer] = useState(null)
  const [selectedObject, setSelectedObject] = useState(null)
  const controlsRef = useRef()
  
  useEffect(() => {
  if (!controlsRef.current) return
  if (selectedObject) return   // stoppa zoom när cinematic är aktiv

  const controls = controlsRef.current
  const camera = controls.object

  if (activeLayer !== null) {
    const targetY = activeLayer * 1.5 - 4.5

    const targetPosition = new THREE.Vector3(0, targetY, 6)
    const targetLookAt = new THREE.Vector3(0, targetY, 0)

    let progress = 0

    const animate = () => {
      progress += 0.05
      if (progress > 1) progress = 1

      camera.position.lerp(targetPosition, progress)
      controls.target.lerp(targetLookAt, progress)
      controls.update()

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()

  } else {
    const targetPosition = new THREE.Vector3(0, 0, 12)
    const targetLookAt = new THREE.Vector3(0, 0, 0)

    let progress = 0

    const animate = () => {
      progress += 0.05
      if (progress > 1) progress = 1

      camera.position.lerp(targetPosition, progress)
      controls.target.lerp(targetLookAt, progress)
      controls.update()

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

}, [activeLayer])

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>

      {/* MAIN 3D SCENE */}
      <Canvas
        shadows
        onPointerMissed={() => setActiveLayer(null)}
        camera={{ position: [0, 0, 12], fov: 50 }}
      >
        <color attach="background" args={['#74725e']} />

        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <pointLight position={[0, 5, 8]} intensity={1.5} />

        <HangingLamp />
        <DustParticles />

        <IndustrialShelf
  setActiveLayer={setActiveLayer}
  setSelectedObject={setSelectedObject}
  activeLayer={activeLayer}
/>
<Text
  position={[0, 8, 0]}   // ovanför översta hyllplanet
  fontSize={0.5}
  color="#f6dc87"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.05}
>
  clear the shelf
</Text>

        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          enableDamping
          dampingFactor={0.1}
        />
      </Canvas>


      {/* FADE OVERLAY */}
      {selectedObject && (
  <div
    onClick={() => setSelectedObject(null)}
    style={{
      position: "absolute",
      inset: 0,
      background: "black",
      opacity: 0.8,
      transition: "opacity 1s ease",
      cursor: "pointer"
    }}
  />
)}


      {/* OBJECT FOCUS MODE */}
      {selectedObject === "letter" && (
  <div
    onClick={() => setSelectedObject(null)} // kan klicka bort cinematic
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10%",
      cursor: "pointer"
    }}

  >
    

          {/* LEFT 3D OBJECT */}
          <Canvas
  style={{ width: "40%", height: "60%" }}
  onClick={(e) => e.stopPropagation()}
>
            <ambientLight intensity={1} />
            <directionalLight position={[5, 5, 5]} />
            <LetterModel
  position={[0, 0, 0]}
  floating={true}
  scale={2.2}
/>
            <OrbitControls />
          </Canvas>

          {/* RIGHT TEXT */}
          <TypewriterText />
        </div>
      )}

    </div>
  )
}