import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { PerspectiveCamera, OrbitControls } from "@react-three/drei"

import Tooltip from "./Tooltip"
import Timeline from "./Timeline"
import Points from "./Points"
import Cuboids from "./Cuboids"
import Loading from "./Loading"

const URL = "https://static.scale.com/uploads/pandaset-challenge/frame_"

function App() {
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
    const paddedPage: string = page.toString().padStart(2, 0)
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
    return <Loading />
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

export default App
