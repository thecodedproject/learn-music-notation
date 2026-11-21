import { useEffect, useRef } from "react"

interface Props {
  level: 0 | 1 | 2 | 3 // none, a sprinkle, a burst, a party
}

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  spin: number
  w: number
  h: number
  color: string
  wobble: number
}

const COLORS = ["#ff5d5d", "#ffb02e", "#ffe14d", "#4cd685", "#3fb4ff", "#8f7bff", "#ff7ad9"]

// Confetti fills the screen with falling paper, more of it the higher the level
export function Confetti({ level }: Props): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas == undefined || level == 0) {
      return
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    const ctx = canvas.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    resize()
    window.addEventListener("resize", resize)

    const pieces: Piece[] = []
    const W = () => window.innerWidth
    const H = () => window.innerHeight
    const make = (x: number, y: number, vx: number, vy: number): Piece => ({
      x, y, vx, vy,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
    })
    // a shower drifts down from above the top of the screen
    const shower = (n: number) => {
      for (let i = 0; i < n; i++) {
        pieces.push(make(Math.random() * W(), -20 - Math.random() * H() * 0.5, (Math.random() - 0.5) * 2, 1 + Math.random() * 2))
      }
    }
    // a burst fires up and out from both bottom corners
    const burst = (n: number) => {
      for (let i = 0; i < n; i++) {
        const left = i % 2 == 0
        const speed = 11 + Math.random() * 9
        // up, and leaning in towards the middle
        const lean = 0.15 + Math.random() * 0.6
        const angle = -Math.PI / 2 + (left ? lean : -lean)
        pieces.push(make(left ? 0 : W(), H(), Math.cos(angle) * speed, Math.sin(angle) * speed))
      }
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    if (level == 1) {
      shower(50)
    } else if (level == 2) {
      burst(140)
      shower(40)
    } else {
      burst(160)
      timers.push(setTimeout(() => burst(160), 600))
      timers.push(setTimeout(() => { burst(160); shower(120) }, 1300))
      timers.push(setTimeout(() => shower(100), 2200))
    }

    let frame = 0
    let last = performance.now()
    const startedAt = last
    const tick = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.7)
      last = now
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W(), H())
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i]
        p.vy += 0.25 * dt
        p.vx *= Math.pow(0.985, dt)
        p.vy *= Math.pow(0.985, dt)
        p.vy = Math.min(p.vy, 4.5)
        p.wobble += 0.1 * dt
        p.x += (p.vx + Math.sin(p.wobble) * 0.6) * dt
        p.y += p.vy * dt
        p.angle += p.spin * dt
        if (p.y > H() + 40) {
          pieces.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.scale(1, Math.cos(p.wobble))
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (pieces.length > 0 || now - startedAt < 2500) {
        frame = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, W(), H())
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      window.removeEventListener("resize", resize)
    }
  }, [level])

  return level == 0 ? null : <canvas ref={canvasRef} className="confetti" aria-hidden="true" />
}
