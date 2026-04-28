import { useState, useEffect } from 'react'

export interface SubwayStop {
  stop_id: string
  stop_name: string
  lat: number
  lon: number
  feed_type: 'subway'
}

export interface BusStop {
  stop_id: string
  stop_name: string
  lat: number
  lon: number
  feed_type: 'bus'
}

export interface CitibikeStation {
  station_id: string
  station_name: string
  lat: number
  lon: number
  capacity: number
}

export interface TransitData {
  subway_stops: SubwayStop[]
  bus_stops: BusStop[]
  citibike_stations: CitibikeStation[]
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:8000'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`)
  return res.json()
}

export function useDatabricks(): TransitData {
  const [subway_stops,      setSubwayStops]      = useState<SubwayStop[]>([])
  const [bus_stops,         setBusStops]          = useState<BusStop[]>([])
  const [citibike_stations, setCitibikeStations]  = useState<CitibikeStation[]>([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      try {
        setLoading(true)
        setError(null)

        const [subwayRows, busRows, citibikeRows] = await Promise.all([
          fetchJson<SubwayStop[]>('/api/stops/subway'),
          fetchJson<BusStop[]>('/api/stops/bus'),
          fetchJson<CitibikeStation[]>('/api/citibike/stations'),
        ])

        if (cancelled) return
        setSubwayStops(subwayRows)
        setBusStops(busRows)
        setCitibikeStations(citibikeRows)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  return { subway_stops, bus_stops, citibike_stations, loading, error }
}
