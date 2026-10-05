import "./styles.css"

export const Snowfall = ({ particles = 300 }: { particles?: number }) => {
  const snowSize = []
  for (let i = 0; i < particles; i++) {
    snowSize.push(i)
  }

  const snowRender = snowSize.map((item) => (
    <div
      key={item}
      className="snow absolute h-2.5 w-2.5 rounded-full bg-white"
    />
  ))

  return <div className="fixed inset-0 h-screen w-full">{snowRender}</div>
}
