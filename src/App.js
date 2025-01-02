import { useMemo, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import {
  Edges,
  PerspectiveCamera,
  shaderMaterial,
  OrbitControls,
} from "@react-three/drei"
import * as THREE from "three"

import "./App.css"

const URL = "https://static.scale.com/uploads/pandaset-challenge/frame_"
const NOOP = () => {}

const cuboidMaterial = new THREE.MeshStandardMaterial({
  color: "#98ce9d",
  opacity: 0.05,
  transparent: true,
})

function Cuboids({ data, onHover, onOut }) {
  return data.map((cuboid, index) => {
    const {
      "position.x": x,
      "position.y": y,
      "position.z": z,
      "dimensions.x": width,
      "dimensions.y": length,
      "dimensions.z": height,
      yaw,
      label,
      stationary,
    } = cuboid

    return (
      <mesh
        onPointerOver={() => {
          onHover(
            `${label}${stationary ? " (stationary)" : " (not stationary)"}`,
          )
        }}
        onPointerLeave={onOut}
        /* translate y <-> z */
        position={[x, z, y]}
        rotation={[0, -yaw, 0]}
        key={`${x}-${y}-${z}-${index}-cuboid`}
        material={cuboidMaterial}
      >
        <boxGeometry args={[width, height, length]} />
        <Edges linewidth={0.5} threshold={1} color="#98ce9d" opacity={0.01} />
      </mesh>
    )
  })
}

const temp = new THREE.Object3D()

// scaling performance by instancing
// https://r3f.docs.pmnd.rs/advanced/scaling-performance#instancing
function Points({ data, max }) {
  const instancedMeshRef = useRef()

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const [x, y, z] = data[i]
      // translate y <-> z
      temp.position.set(x, z, y)
      temp.updateMatrix()

      // closer to "ground level": whiter, closer to max value: blacker
      const howCloseToMax = 1 - Math.max(z, 0) / max
      const shadeOfGrey = parseInt(255 * howCloseToMax, 10)
        .toString(16)
        .repeat(3)

      instancedMeshRef.current.setColorAt(i, new THREE.Color(`#${shadeOfGrey}`))
      instancedMeshRef.current.setMatrixAt(i, temp.matrix)
    }
    // Update the instance
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, data.length]}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshStandardMaterial color="#FFFFFF" />
    </instancedMesh>
  )
}

const PAGES = 50

function Timeline({ page, onChange }) {
  return (
    <div className="pages-container">
      <ul className="pages-list">
        {new Array(PAGES).fill(0).map((_, index) => {
          return (
            <li
              key={`${index}-page`}
              style={{ opacity: index === page ? 1 : 0.5 }}
            >
              <button
                style={{ cursor: index === page ? "default" : "pointer" }}
                onClick={() => (index !== page ? onChange(index) : NOOP)}
                title={
                  index === page
                    ? `On page ${index + 1}`
                    : `Go to page ${index + 1}`
                }
              ></button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Tooltip({ label }) {
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)

  useEffect(() => {
    if (label === "") {
      return
    }

    const setPos = (ev) => {
      setPosX(ev.clientX)
      setPosY(ev.clientY)
    }
    document.addEventListener("mousemove", setPos)

    return () => document.removeEventListener("mousemove", setPos)
  }, [label])

  if (label === "") {
    return null
  }

  return (
    <div className="tooltip" style={{ top: posY + 10, left: posX + 10 }}>
      {label}
    </div>
  )
}

export function App() {
  const [page, setPage] = useState(0)
  const [points, setPoints] = useState([])
  const [max, setMax] = useState(0)
  const [cuboids, setCuboids] = useState([])
  const [tooltip, setTooltip] = useState("")

  const handleHover = (str) => {
    setTooltip(str)
    document.body.style.cursor = "pointer"
  }
  const handleOut = () => {
    setTooltip("")
    document.body.style.cursor = "default"
  }
  const handleChangePage = (page) => setPage(page)

  useEffect(() => {
    const paddedPage = page.toString().padStart(2, 0)
    setPoints([])
    setCuboids([])
    setMax(0)

    const run = async () => {
      const url = `${URL}${paddedPage}.json`
      const raw = await fetch(url)
      const res = await raw.json()
      const max = res.points.reduce((p, c) => (c[2] > p ? c[2] : p), 0)

      setPoints(res.points)
      setCuboids(res.cuboids)
      setMax(max)
    }
    run()
  }, [page])

  if (points.length === 0) {
    return <div>Loading</div>
  }

  return (
    <>
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <PerspectiveCamera makeDefault position={[25, 20, 10]} fov={75} />
        <Points data={points} max={max} />
        <Cuboids data={cuboids} onHover={handleHover} onOut={handleOut} />
        <OrbitControls enablePan={false} />
      </Canvas>
      <Tooltip label={tooltip} />
      <Timeline onChange={handleChangePage} page={page} />
    </>
  )
}
