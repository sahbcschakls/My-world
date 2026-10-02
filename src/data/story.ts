// ─────────────────────────────────────────────────────────────
//  THE STORY. Edit this file to change any copy on the journey.
//  Each chapter is one stop on the road, in scroll order.
// ─────────────────────────────────────────────────────────────

export type VehicleId =
  | 'stroller'
  | 'tricycle'
  | 'bicycle'
  | 'gearcycle'
  | 'moped'
  | 'scooter'
  | 'motorcycle'
  | 'car'

export type StationId =
  | 'home'
  | 'school'
  | 'tenth'
  | 'fork'
  | 'design'
  | 'pivot'
  | 'seniors'
  | 'clients'
  | 'freelance'
  | 'next'

export interface Chapter {
  id: StationId
  /** Small label above the title, e.g. an age or a year. */
  kicker: string
  title: string
  body: string
  vehicle: VehicleId
  /** Camera offset relative to the rider: [side, up, back]. */
  camera: [number, number, number]
}

export const VEHICLE_LABEL: Record<VehicleId, string> = {
  stroller: 'Pram',
  tricycle: 'Tricycle',
  bicycle: 'Bicycle',
  gearcycle: 'Geared cycle',
  moped: 'Moped',
  scooter: 'Scooter',
  motorcycle: 'Motorcycle',
  car: 'Car',
}

export const chapters: Chapter[] = [
  {
    id: 'home',
    kicker: 'Km 0 · Day one',
    title: 'It all started here.',
    body: 'I was born. Tiny, loud and already curious about everything around me. Nobody knew the road would be this long, or this fun.',
    vehicle: 'stroller',
    camera: [6.5, 2.6, 3.6],
  },
  {
    id: 'school',
    kicker: 'School days',
    title: 'Three wheels and a school bag.',
    body: 'School began, and so did the doodles in the margins. I was on a tricycle, never far from home, but already looking down the street.',
    vehicle: 'tricycle',
    camera: [6, 2.3, 3.4],
  },
  {
    id: 'tenth',
    kicker: 'Up to the 10th',
    title: 'Pretty good, till the 10th.',
    body: 'Two wheels now. School went well and I rode a bit further every year. Then the 10th came, and with it the first big question.',
    vehicle: 'bicycle',
    camera: [6.5, 2.5, 3.6],
  },
  {
    id: 'fork',
    kicker: 'The 12th · A fork in the road',
    title: 'Medicine, or design?',
    body: 'Everyone expected medical. I chose design after my 12th. It was the biggest decision I had made, and the first one that was fully mine.',
    vehicle: 'gearcycle',
    camera: [4, 7.5, 7],
  },
  {
    id: 'design',
    kicker: 'Into design',
    title: 'Shifting gears.',
    body: 'Design school taught me to see differently: form, colour, people, purpose. I added gears and climbed hills I would have walked up before.',
    vehicle: 'gearcycle',
    camera: [6.5, 2.6, 3.4],
  },
  {
    id: 'pivot',
    kicker: 'Product → digital product',
    title: 'From objects to screens.',
    body: 'I set out to be a product designer. Along the way I found that what I loved most was shaping experiences, so I moved to digital product design.',
    vehicle: 'moped',
    camera: [7, 2.8, 3.6],
  },
  {
    id: 'seniors',
    kicker: 'Apprenticeship',
    title: 'Learning from the riders ahead.',
    body: 'I worked as an apprentice under my seniors. I listened, asked too many questions and made friends, and picked up the craft hands-on.',
    vehicle: 'scooter',
    camera: [6.5, 2.6, 3.4],
  },
  {
    id: 'clients',
    kicker: 'Real clients',
    title: 'Real roads, real traffic.',
    body: 'Client projects arrived: real briefs, deadlines and feedback. I learned to ship work that holds up outside the studio.',
    vehicle: 'scooter',
    camera: [7, 3, 3.8],
  },
  {
    id: 'freelance',
    kicker: 'You are here',
    title: 'My own ride.',
    body: 'Now I run my own projects and freelance work and take responsibility from the first call to the final handoff. I love travelling, and this is the part of the trip I enjoy most.',
    vehicle: 'motorcycle',
    camera: [6.5, 2.6, 3.8],
  },
  {
    id: 'next',
    kicker: 'Next stop',
    title: 'Room for a bigger journey.',
    body: 'I am ready for the next phase: a full-time role with a team to grow with. Same traveller, bigger vehicle. Want to ride along?',
    vehicle: 'car',
    camera: [7.5, 3.2, 5.5],
  },
]

// ─── Work section (placeholders: replace with real projects) ───
export interface Project {
  title: string
  role: string
  year: string
  blurb: string
  tint: 'pink' | 'mint' | 'sky' | 'lemon' | 'lilac' | 'peach'
}

export const projects: Project[] = [
  { title: 'Project One', role: 'Product design · Client', year: '2026', blurb: 'Short one-line summary of the problem and the result.', tint: 'pink' },
  { title: 'Project Two', role: 'UX · UI · Freelance', year: '2025', blurb: 'Short one-line summary of the problem and the result.', tint: 'mint' },
  { title: 'Project Three', role: 'Design system', year: '2025', blurb: 'Short one-line summary of the problem and the result.', tint: 'sky' },
  { title: 'Project Four', role: 'Mobile app', year: '2024', blurb: 'Short one-line summary of the problem and the result.', tint: 'lemon' },
  { title: 'Project Five', role: 'Apprentice work', year: '2024', blurb: 'Short one-line summary of the problem and the result.', tint: 'lilac' },
  { title: 'Project Six', role: 'Product design (physical)', year: '2023', blurb: 'Short one-line summary of the problem and the result.', tint: 'peach' },
]

export const profile = {
  name: 'Your Name',
  role: 'Digital Product Designer',
  email: 'hello@example.com',
}
