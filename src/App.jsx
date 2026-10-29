
import React, { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ResourceCatalog from './components/ResourceCatalog'
import AuthModal from './components/AuthModal'
import AuthStatusBanner from './components/AuthStatusBanner'
import BookingRequestModal from './components/BookingRequestModal'
import StudentBookingsView from './components/StudentBookingsView'
import OwnerDashboardView from './components/OwnerDashboardView'
import Footer from './components/Footer'

function CampusShareApp() {
  const [currentView, setCurrentView] = useState('catalog')
  const [selectedResourceToBook, setSelectedResourceToBook] = useState(null)

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: 'login',
  })

  const openAuth = (mode = 'login') => {
    setAuthModalState({
      isOpen: true,
      mode,
    })
  }

  const closeAuth = () => {
    setAuthModalState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const handleSelectResourceToBook = (resource) => {
    setSelectedResourceToBook(resource)
  }

  const handleBookingSuccess = () => {
    // Booking-specific refreshes can be added here when needed.
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      {/* Authentication and connection status */}
      <AuthStatusBanner onOpenAuth={openAuth} />

      {/* Main navigation */}
      <Navbar
        onOpenAuth={openAuth}
        currentView={currentView}
        onNavigateView={setCurrentView}
      />

      {/* Main page content */}
      <main className="flex-1">
        <div key={currentView} className="animate-page-enter">
          {currentView === 'catalog' && (
            <>
              <Hero onOpenAuth={openAuth} />

              <ResourceCatalog
                onOpenAuth={openAuth}
                onSelectResourceToBook={handleSelectResourceToBook}
              />
            </>
          )}

          {currentView === 'my-bookings' && (
            <StudentBookingsView
              onExploreCatalog={() => setCurrentView('catalog')}
            />
          )}

          {currentView === 'owner-dashboard' && (
            <OwnerDashboardView
              onExploreCatalog={() => setCurrentView('catalog')}
            />
          )}
        </div>
      </main>

      {/* Site footer */}
      <Footer />

      {/* Authentication modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={closeAuth}
      />

      {/* Booking request modal */}
      <BookingRequestModal
        isOpen={Boolean(selectedResourceToBook)}
        resource={selectedResourceToBook}
        onClose={() => setSelectedResourceToBook(null)}
        onBookingSuccess={handleBookingSuccess}
        onOpenMyBookings={() => setCurrentView('my-bookings')}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CampusShareApp />
    </AuthProvider>
  )
}
