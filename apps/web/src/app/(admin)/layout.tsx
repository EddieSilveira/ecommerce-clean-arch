import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <span className="text-xs font-medium tracking-wider uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
            Admin
          </span>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  )
}
