import { createContext, useContext } from 'react'

export type ThemeName = 'light' | 'dark'

export interface Palette {
  skyTop: string
  skyBottom: string
  fog: string
  ground: string
  groundAlt: string
  road: string
  roadLine: string
  roadEdge: string
  sun: string
  sunIntensity: number
  ambient: string
  ambientIntensity: number
  hemiGround: string
  lampGlow: number
  leaf: string[]
  trunk: string
  mountain: string[]
  cloud: string
  water: string
  // Accent pastels used by vehicles and landmarks.
  pink: string
  mint: string
  sky: string
  lemon: string
  lilac: string
  peach: string
  coral: string
  ink: string
  paper: string
}

const accents = {
  pink: '#ffb3c7',
  mint: '#9fe3c8',
  sky: '#a8d4ff',
  lemon: '#ffe48a',
  lilac: '#c9b6ff',
  peach: '#ffc7a1',
  coral: '#ff8f8f',
}

export const palettes: Record<ThemeName, Palette> = {
  light: {
    skyTop: '#9fd3ff',
    skyBottom: '#ffe6ef',
    fog: '#fbe9f1',
    ground: '#c9efc0',
    groundAlt: '#b4e5b6',
    road: '#7d7a93',
    roadLine: '#fff6d6',
    roadEdge: '#f3e9ff',
    sun: '#fff1de',
    sunIntensity: 2.6,
    ambient: '#ffffff',
    ambientIntensity: 0.55,
    hemiGround: '#f6d9c7',
    lampGlow: 0,
    leaf: ['#8fd9a8', '#a6e3a1', '#7fcf9f', '#ffc2d6', '#ffd8a8'],
    trunk: '#b08968',
    mountain: ['#c9c2ff', '#b6d8ff', '#ffd1e3'],
    cloud: '#ffffff',
    water: '#9fdcff',
    ...accents,
    ink: '#2b2840',
    paper: '#fffaf5',
  },
  dark: {
    skyTop: '#0f1030',
    skyBottom: '#3b2b5c',
    fog: '#2a2148',
    ground: '#3d5f68',
    groundAlt: '#36545c',
    road: '#3a3852',
    roadLine: '#ffe7a3',
    roadEdge: '#6f6496',
    sun: '#b9b5ff',
    sunIntensity: 1.4,
    ambient: '#8c86d9',
    ambientIntensity: 0.65,
    hemiGround: '#2b2340',
    lampGlow: 1,
    leaf: ['#4f9c86', '#5fae8e', '#3f8a78', '#c27aa1', '#c79a6f'],
    trunk: '#6d5547',
    mountain: ['#3c3570', '#2f3f73', '#57406f'],
    cloud: '#6e6a9e',
    water: '#3a5f8f',
    ...accents,
    ink: '#f4f0ff',
    paper: '#1b1a2e',
  },
}

export const ThemeContext = createContext<Palette>(palettes.light)
export const usePalette = () => useContext(ThemeContext)
