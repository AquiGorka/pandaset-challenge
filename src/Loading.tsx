import { useEffect, useState } from "react"
import "./Loading.css"

let i = "·"

function Loading() {
  const [text, setText] = useState("·")

  useEffect(() => {
    const id = setInterval(() => {
      if (i === "···") {
        i = ""
      }
      i = i + "·"
      setText(i)
    }, 300)

    return () => clearInterval(id)
  }, [])

  return <div className="wrap">{text}</div>
}

export default Loading
