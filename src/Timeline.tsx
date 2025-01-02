import "./Timeline.css"

const PAGES = 50
const NOOP = () => {}

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

export default Timeline
