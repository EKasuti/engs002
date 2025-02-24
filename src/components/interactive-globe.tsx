"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { useTheme } from "@/context/ThemeContext"
import earthTextureUrl from "../images/earth.jpg"
import { Building, buildings } from "@/data/buildings"

// -------------------- GLOBE COMPONENT --------------------
function Globe({
  setSelectedBuilding,
  selectedBuilding,
  setHoveredBuilding,
  setPointerPos,
}: {
  setSelectedBuilding: (building: Building) => void
  selectedBuilding: Building | null
  hoveredBuilding: Building | null
  setHoveredBuilding: (building: Building | null) => void
  setPointerPos: (pos: { x: number; y: number }) => void
}) {
  const globeRef = useRef<THREE.Mesh>(null)
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null)
  const markersRef = useRef<THREE.Mesh[]>([])
  const mouseClickRef = useRef(false)

  // Loading Earth texture
  useEffect(() => {
    if (earthTextureUrl) {
      new THREE.TextureLoader().load(earthTextureUrl.src, (texture) => {
        setEarthTexture(texture)
      })
    }
  }, [])

  // Creating marker meshes
  useEffect(() => {
    if (!globeRef.current || !earthTexture) return

    const currentGlobe = globeRef.current

    const addMarker = (lat: number, lon: number, building: Building) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)

      const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16)
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)

      // Positioning markers on the globe
      const radius = 5.1
      marker.position.x = -(radius * Math.sin(phi) * Math.cos(theta))
      marker.position.y = radius * Math.cos(phi)
      marker.position.z = radius * Math.sin(phi) * Math.sin(theta)

      marker.userData = { building }

      currentGlobe.add(marker)
      markersRef.current.push(marker)
    }

    // Marker for each building
    buildings.forEach((b) => addMarker(b.lat, b.lon, b))

    // Cleanup for markers on unmount
    return () => {
      if (currentGlobe) {
        while (currentGlobe.children.length > 0) {
          currentGlobe.remove(currentGlobe.children[0])
        }
      }
      markersRef.current = []
    }
  }, [earthTexture])

  // When a marker is clicked
  const handleMarkerClick = (building: Building) => {
    setSelectedBuilding(building)
  }

  // Detecting when a marker is clicked
  const handleMarkerSelection = ({
    camera,
    raycaster,
    pointer,
  }: {
    camera: THREE.Camera
    raycaster: THREE.Raycaster
    pointer: THREE.Vector2
  }) => {
    if (!globeRef.current) return

    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(markersRef.current, true)
    if (intersects.length > 0) {
      const clickedMarker = intersects[0].object
      const building = clickedMarker.userData.building
      if (building !== selectedBuilding) {
        handleMarkerClick(building)
      }
    }
  }

  // Track clicks
  const handleClick = () => {
    mouseClickRef.current = true
    setTimeout(() => {
      mouseClickRef.current = false
    }, 100)
  }

  // Use frame for click + hover detection
  useFrame((state) => {
    const { camera, raycaster, pointer } = state

    // 1) Handling marker clicks
    if (mouseClickRef.current) {
      handleMarkerSelection({ camera, raycaster, pointer })
    }

    // 2) Handling marker hover
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(markersRef.current, true)
    if (intersects.length > 0) {
      const hoveredMarker = intersects[0].object
      setHoveredBuilding(hoveredMarker.userData.building)
    } else {
      setHoveredBuilding(null)
    }

    // 3) Converting normalized device coords to screen coords
    const screenX = (pointer.x + 1) * (window.innerWidth / 2)
    const screenY = (-pointer.y + 1) * (window.innerHeight / 2)
    setPointerPos({ x: screenX, y: screenY })
  })

  // Attaching the click event listener
  useEffect(() => {
    const canvas = document.querySelector("canvas")
    canvas?.addEventListener("click", handleClick)
    return () => {
      canvas?.removeEventListener("click", handleClick)
    }
  }, [])

  if (!earthTexture) return null

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh ref={globeRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial map={earthTexture} />
      </mesh>
    </>
  )
}

// -------------------- INTERACTIVE GLOBE --------------------
export default function InteractiveGlobe() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)

  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null)
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { isDarkMode } = useTheme()

  const filteredBuildings = buildings.filter((building) => {
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || building.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="relative h-full">
      {/* ----------- Canvas + 3D Scene ----------- */}
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <Suspense fallback={null}>
          <Globe
            setSelectedBuilding={setSelectedBuilding}
            selectedBuilding={selectedBuilding}
            hoveredBuilding={hoveredBuilding}
            setHoveredBuilding={setHoveredBuilding}
            setPointerPos={setPointerPos}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.25}
            minDistance={7}
            maxDistance={20}
            makeDefault
          />
        </Suspense>
      </Canvas>

      {/* ----------- Search & Filter Controls ----------- */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <Input
          type="search"
          placeholder="Search buildings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 bg-[#CCCCD0] text-black placeholder:text-black"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64 bg-[#CCCCD0] backdrop-blur-sm text-black">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-[#CCCCD0] text-black">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Roman Architecture">Roman Architecture</SelectItem>
            <SelectItem value="Modernism">Modernism</SelectItem>
            <SelectItem value="Mughal Architecture">Mughal Architecture</SelectItem>
            <SelectItem value="Ancient Egyptian Architecture">Ancient Egyptian Architecture</SelectItem>
            <SelectItem value="Ancient Greek Architecture">Ancient Greek Architecture</SelectItem>
            <SelectItem value="Prehistoric Monument">Prehistoric Monument</SelectItem>
            <SelectItem value="Ancient Roman Architecture">Ancient Roman Architecture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ----------- Reset View Button ----------- */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          className="bg-white text-black"
          onClick={() => {
            const controls = document.querySelector("canvas")
            if (controls) {
              controls.dispatchEvent(new CustomEvent("reset-orbit"))
            }
          }}
        >
          Reset View
        </Button>
      </div>

      {/* ----------- Building Details Dialog ----------- */}
      {selectedBuilding && (
        <Dialog
          open={!!selectedBuilding}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedBuilding(null)
            }
          }}
        >
          <DialogContent
            className={`${isDarkMode ? "bg-black" : "bg-white"}`}
            aria-describedby="building-details-description"
          >
            <DialogHeader>
              <DialogTitle>{selectedBuilding.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" id="building-details-description">
              <Image
                src={selectedBuilding.image}
                alt={selectedBuilding.name}
                width={500}
                height={200}
                className="w-full h-48 object-cover rounded-lg"
              />
              <p>
                <strong>Category:</strong> {selectedBuilding.category}
              </p>
              <p>
                <strong>Location:</strong> Lat: {selectedBuilding.lat}, Lon: {selectedBuilding.lon}
              </p>
              <p className="text-muted-foreground">{selectedBuilding.details}</p>
              <Button variant="default" className="text-white">
                View Related Lecture
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ----------- Buildings List (Search Filtered) ----------- */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#CCCCD0] rounded-lg">
        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-black">Buildings</h2>
          <ul className="space-y-2">
            {filteredBuildings.map((b) => (
              <li key={b.id}>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBuilding(b)}
                  className="w-full justify-start bg-white text-black"
                >
                  {b.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ----------- Tooltip for hovered building ----------- */}
      {hoveredBuilding && (
        <div
          style={{
            position: "absolute",
            left: pointerPos.x + 10,
            top: pointerPos.y + 10,
            pointerEvents: "none",
            backgroundColor: "white",
            color: "black",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
          }}
        >
          <strong>{hoveredBuilding.name}</strong>
          <div>{hoveredBuilding.category}</div>
        </div>
      )}
    </div>
  )
}
