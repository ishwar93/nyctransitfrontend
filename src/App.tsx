import TransitMap from './components/Map.tsx'
import './styles/globals.css'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <TransitMap />
    </div>
  )
}
