# My World

A scroll-driven 3D portfolio. You follow the designer down one winding road, from a pram to a tricycle, a bicycle, a geared cycle, a moped, a scooter, a motorcycle and finally a car. The work section comes after the road ends.

**Stack:** Vite · React 19 · TypeScript · Three.js · React Three Fiber · drei · Lenis (smooth scroll)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where to edit things

| What | File |
| --- | --- |
| Story copy, chapter order, vehicle per chapter, camera framing | `src/data/story.ts` |
| Work projects, name, email | `src/data/story.ts` (`projects`, `profile`) |
| Light / dark palettes (3D) | `src/theme.ts` |
| Light / dark palettes (UI) | `src/styles.css` (`:root` variables) |
| Vehicles | `src/three/Vehicles.tsx` |
| Rider (avatar, pose, helmet, backpack) | `src/three/Avatar.tsx` |
| Landmark at each stop (house, school, fork, studio, …) | `src/three/Landmarks.tsx` |
| Road shape, trees, lamps, clouds, mountains | `src/three/road.ts`, `src/three/Scenery.tsx` |
| Camera, lighting, vehicle swap animation | `src/three/World.tsx` |

## How it works

- The journey section is `chapters × 130vh` tall, with the canvas pinned inside it (`position: sticky`). Scroll position becomes `journey.target` (0 to 1).
- Every frame, the render loop eases `journey.progress` toward that target. The progress value sets where the rider is on the road, which spins the wheels and drives the pedalling.
- Each chapter owns an equal slice of the scroll. When you cross into a new slice, the vehicle swaps with a springy pop and a puff of smoke.
- The rider's arms and legs are positioned with two-bone IK every frame, so the feet stay on the pedals and the hands stay on the bars, whatever vehicle they're on.
- All 3D content is built in code from primitives, so the page needs no model downloads and loads fast.

## Swapping in real 3D models later

Each vehicle is one component in `Vehicles.tsx`. To use a real model, export a `.glb` file (from Blender, Spline or Sketchfab), put it in `public/models/`, and replace the component body with drei's `useGLTF`. Keep the model facing +Z with its wheels on y = 0.
