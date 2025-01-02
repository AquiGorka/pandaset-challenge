import { useState, useEffect } from "react"
import "./Tooltip.css"

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

export default Tooltip
