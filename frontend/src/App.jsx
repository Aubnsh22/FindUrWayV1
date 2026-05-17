import { Toaster } from 'sonner'
import FindUrWayOS from './components/os/FindUrWayOS'

export default function App() {
  return (
    <>
      <FindUrWayOS />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'mono text-xs uppercase tracking-widest bg-black text-white border border-gray-800 rounded-none',
        }}
      />
    </>
  )
}
