import { useState, useMemo, useEffect } from 'react'
import MapGL from 'react-map-gl/maplibre'
import DeckGL from '@deck.gl/react'
import { MVTLayer } from '@deck.gl/geo-layers'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { PickingInfo } from '@deck.gl/core'

import { INITIAL_VIEW_STATE } from '../data/Mockdata'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

/** Must match `onViewStateChange` clamp and tippecanoe max zoom for transit_stops.mbtiles. */
const MIN_ZOOM = 14
const MAX_ZOOM = 15

/** Proxied to Martin (see vite.config.js → /vector/transit_stops → localhost:3000/transit_stops). */
const TRANSIT_TILES = '/vector/transit_stops/{z}/{x}/{y}'
/** Proxied to Martin (see vite.config.js → /vector/transit_route_geom → localhost:3000/transit_route_geom). */
const ROUTE_TILES = '/vector/transit_route_geom/{z}/{x}/{y}'

const DOT_RADIUS: Record<string, number> = { subway: 22, bus: 10, citibike: 5 }
const DOT_COLOR: Record<string, [number, number, number, number]> = {
  subway:   [30,  40,  80,  230],
  bus:      [100, 110, 130, 200],
  citibike: [180, 120, 20,  220],
}

const DEFAULT_DOT: [number, number, number, number] = [120, 120, 120, 160]

interface TransitStopProps {
  location_id?: string
  location_name?: string
  location_type?: string
}

interface RouteGeomProps {
  feed_id?: string
  route_id?: string
  route_color?: string
}

interface Props {
  onHover?: (info: PickingInfo) => void
}

function hexToRgba(routeColor?: string): [number, number, number, number] {
  const value = String(routeColor ?? '').trim().replace(/^#/, '')
  if (!/^[0-9A-Fa-f]{6}$/.test(value)) return [80, 80, 80, 190]

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    210,
  ]
}

function getRouteLineWidth(feedId?: string): number {
  const id = String(feedId ?? '').toLowerCase()
  if (id.startsWith('subway')) return 5
  if (id.startsWith('bus')) return 1
  return 2.5
}

export default function TransitMap({ onHover }: Props) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [lionUnassigned, setLionUnassigned] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/lion_street_only.geojson')
      .then((resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        return resp.json()
      })
      .then((data) => {
        if (!cancelled) setLionUnassigned(data)
      })
      .catch((err) => {
        // Temporary overlay; keep app functional if file is missing.
        console.warn('lion_unassigned.geojson not loaded:', err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const routeGeomLayer = useMemo(
    () =>
      new MVTLayer<RouteGeomProps>({
        id: 'route-geom-mvt',
        data: ROUTE_TILES,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        pickable: false,
        stroked: true,
        filled: false,
        lineWidthUnits: 'pixels',
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 5,
        getLineWidth: (f: { properties?: RouteGeomProps }) => getRouteLineWidth(f.properties?.feed_id),
        getLineColor: (f: { properties?: RouteGeomProps }) => hexToRgba(f.properties?.route_color),
      }),
    [],
  )

  // const routeGeomLayer = useMemo(() => new MVTLayer({
  //   id: 'route-geom-mvt',
  //   data: ROUTE_TILES,
  //   minZoom: 14,
  //   maxZoom: 15,
  //   pickable: false,
  //   stroked: true,
  //   filled: false,
  //   lineWidthUnits: 'pixels',
  //   getLineWidth: (f) => {
  //     const base = 2
  //     const pulse = 1 + 0.5 * Math.sin(tick * 2.5)
  //     return base * pulse
  //   },
  //   getLineColor: (f) => {
  //     const [r, g, b] = hexToRgba(f.properties?.route_color)
  //     const a = 140 + Math.floor(80 * (0.5 + 0.5 * Math.sin(tick * 3.0)))
  //     return [r, g, b, a]
  //   },
  //   updateTriggers: {
  //     getLineWidth: tick,
  //     getLineColor: tick
  //   }
  // }), [])
  const transitLayer = useMemo(
    () =>
      new MVTLayer<TransitStopProps>({
        id: 'transit-stops-mvt',
        data: TRANSIT_TILES,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        pickable: true,
        uniqueIdProperty: 'location_id',
        pointType: 'circle',
        stroked: false,
        filled: true,
        pointRadiusUnits: 'meters',
        getPointRadius: (f: { properties?: TransitStopProps }) => {
          const t = String(f.properties?.location_type ?? '')
          return DOT_RADIUS[t] ?? 14
        },
        getFillColor: (f: { properties?: TransitStopProps }) => {
          const t = String(f.properties?.location_type ?? '')
          return DOT_COLOR[t] ?? DEFAULT_DOT
        },
        onHover,
      }),
    [onHover],
  )

  const lionUnassignedLayer = useMemo(
    () =>
      new GeoJsonLayer({
        id: 'lion-unassigned',
        data: lionUnassigned ?? { type: 'FeatureCollection', features: [] },
        pickable: true,
        stroked: true,
        filled: false,
        lineWidthUnits: 'pixels',
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 4,
        getLineWidth: 1.5,
        getLineColor: [232, 43, 72, 220],
      }),
    [lionUnassigned],
  )

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState: vs }) => {
        const next = vs as typeof INITIAL_VIEW_STATE
        setViewState({
          ...next,
          zoom:    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom)),
          pitch:   45,
          bearing: 0,
        })
      }}
      controller
      layers={[routeGeomLayer, lionUnassignedLayer, transitLayer]}
      style={{ position: 'absolute', inset: '0' }}
      getCursor={({ isHovering }) => (isHovering ? 'crosshair' : 'grab')}
    >
      <MapGL reuseMaps mapStyle={MAP_STYLE} attributionControl={false} />
    </DeckGL>
  )
}
