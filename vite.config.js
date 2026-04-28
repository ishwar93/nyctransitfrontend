import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Martin MBTiles source id must match path segment (e.g. transit_stops.mbtiles → /transit_stops/…)
      '/vector/transit_stops': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/vector\/transit_stops/, '/transit_stops'),
      },
      '/vector/transit_route_geom': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/vector\/transit_route_geom/, '/transit_route_geom'),
      },
      '/tiles': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/tiles/, '/isochrones'),
      },
    },
  },
})