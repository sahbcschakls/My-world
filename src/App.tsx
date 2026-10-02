import * as THREE from 'three'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import Lenis from 'lenis'
import { chapters, profile, projects, VEHICLE_LABEL } from './data/story'
import { chapterAt, chapterCenter, journey } from './store'
import { palettes, ThemeContext, type ThemeName } from './theme'
import { World } from './three/World'

const VH_PER_CHAPTER = 130

function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(() => (document.documentElement.dataset.theme as ThemeName) || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch { /* private mode */ }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))] as const
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const section = useRef<HTMLElement>(null)
  const lenis = useRef<Lenis | null>(null)
  const [active, setActive] = useState(0)
  const [km, setKm] = useState(0)

  // Smooth scrolling + scroll → journey progress.
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const l = reduce ? null : new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    lenis.current = l
    let raf = 0
    const read = () => {
      const el = section.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = THREE.MathUtils.clamp(-r.top / (r.height - innerHeight), 0, 1)
      journey.target = p
      document.documentElement.style.setProperty('--p', p.toFixed(4))
      setActive(chapterAt(p))
      setKm(Math.round(p * (chapters.length - 1) * 12))
    }
    const loop = (t: number) => { l?.raf(t); read(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); l?.destroy() }
  }, [])

  const goTo = useCallback((i: number) => {
    const el = section.current
    if (!el) return
    const top = el.offsetTop + chapterCenter(i) * (el.offsetHeight - innerHeight)
    if (lenis.current) lenis.current.scrollTo(top, { duration: 1.8 })
    else window.scrollTo({ top, behavior: 'auto' })
  }, [])

  const chapter = chapters[active]
  const palette = palettes[theme]

  return (
    <ThemeContext.Provider value={palette}>
      <header className="topbar">
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); lenis.current ? lenis.current.scrollTo(0) : scrollTo(0, 0) }}>
          <span className="brand-dot" />{profile.name}
        </a>
        <div className="odometer" aria-label={`Kilometre ${km}, riding a ${VEHICLE_LABEL[chapter.vehicle]}`}>
          <span className="odo-km">KM {String(km).padStart(3, '0')}</span>
          <span className="odo-sep" />
          <span className="odo-ride">{VEHICLE_LABEL[chapter.vehicle]}</span>
        </div>
        <nav className="topnav">
          <a href="#work" onClick={(e) => { e.preventDefault(); lenis.current?.scrollTo('#work') ?? document.getElementById('work')?.scrollIntoView() }}>Work</a>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <span className="tt-track"><span className="tt-thumb">{theme === 'light' ? '☀' : '☾'}</span></span>
          </button>
        </nav>
      </header>

      <section ref={section} className="journey" style={{ height: `${chapters.length * VH_PER_CHAPTER + 100}vh` }} id="top">
        <div className="stage">
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ fov: 38, near: 0.1, far: 900, position: [6, 3, -6] }}
            gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <World />
            </Suspense>
            <AdaptiveDpr pixelated={false} />
          </Canvas>

          <div className="hero">
            <p className="hero-kicker">{profile.role} · a portfolio you can ride through</p>
            <h1>Every journey starts<br />with three wheels.</h1>
            <p className="hero-hint"><span className="mouse" />Scroll to ride along</p>
          </div>

          <article key={chapter.id} className="card" aria-live="polite">
            <div className="card-head">
              <span className="stamp">{String(active + 1).padStart(2, '0')}</span>
              <span className="kicker">{chapter.kicker}</span>
            </div>
            <h2>{chapter.title}</h2>
            <p>{chapter.body}</p>
            <div className="ride-tag">Riding · {VEHICLE_LABEL[chapter.vehicle]}</div>
          </article>

          <ol className="rail" aria-label="Chapters">
            {chapters.map((c, i) => (
              <li key={c.id} className={i === active ? 'on' : i < active ? 'done' : ''}>
                <button onClick={() => goTo(i)} aria-label={`Go to: ${c.title}`}>
                  <span className="rail-label">{c.kicker}</span>
                  <span className="rail-dot" />
                </button>
              </li>
            ))}
          </ol>
          <div className="progress"><span /></div>
        </div>
      </section>

      <main id="work" className="work">
        <div className="work-inner">
          <p className="eyebrow">The road so far</p>
          <h2 className="work-title">Selected work</h2>
          <div className="grid">
            {projects.map((pr) => (
              <a key={pr.title} className={`project tint-${pr.tint}`} href="#">
                <div className="project-art"><span>{pr.title.slice(0, 1)}</span></div>
                <div className="project-meta">
                  <h3>{pr.title}</h3>
                  <span>{pr.year}</span>
                </div>
                <p className="project-role">{pr.role}</p>
                <p className="project-blurb">{pr.blurb}</p>
              </a>
            ))}
          </div>
        </div>
        <footer className="contact">
          <h2>Let's take the next trip together.</h2>
          <a className="cta" href={`mailto:${profile.email}`}>{profile.email}</a>
          <p className="fineprint">© {new Date().getFullYear()} {profile.name}. Built with React Three Fiber.</p>
        </footer>
      </main>
    </ThemeContext.Provider>
  )
}
