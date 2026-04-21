/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  User, 
  Bookmark, 
  ArrowLeft,
  ChevronRight,
  Menu,
  VolumeX,
  Trees,
  Bed,
  CheckCircle,
  ReceiptText,
  ShieldCheck,
  House,
  Waves,
  Mountain,
  LayoutGrid,
  FileText,
  Search,
  ArrowRight,
  LogOut,
  Trash2,
  Info,
  Globe,
  Wind
} from 'lucide-react';
import { REST_HOUSES } from './constants';
import { ForestRestHouse, AccommodationSet, Status, BookingRecord } from './types';
import { StatusBadge, PropertyCard, SetCard } from './components/ui';
import { BookingCalendar } from './components/BookingCalendar';

type View = 'SPLASH' | 'EXPLORE' | 'DETAIL' | 'ADMIN_DASHBOARD' | 'ADMIN_EDIT' | 'SET_DETAIL' | 'BOOKINGS';

// Firebase Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default function App() {
  const [restHouses, setRestHouses] = useState<ForestRestHouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time synchronization
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'restHouses'), (snapshot) => {
      if (!snapshot.empty) {
        const houses = snapshot.docs.map(doc => doc.data() as ForestRestHouse);
        setRestHouses(houses);
        setIsLoading(false);
      } else {
        // Only setIsLoading(false) so the UI shows, 
        // seeding will be handled by admin if needed
        setIsLoading(false);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
      setIsLoading(false);
    });

    const authUnsub = onAuthStateChanged(auth, (user) => {
      // In this version, we wait for explicit Google Login for writes
    });

    return () => { unsub(); authUnsub(); };
  }, []);

  const handleCloudSync = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to ensure the user can pick the right email
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Authenticated as:", user.email);

      const AUTHORIZED_EMAILS = ["vasudoegar@gmail.com", "dfomandi@gmail.com"];
      const userEmail = user.email?.toLowerCase();

      if (!userEmail || !AUTHORIZED_EMAILS.includes(userEmail)) {
        alert(`Warning: You are signed in as ${user.email}, but only authorized admins have cloud write permissions. Please sign in with an authorized account.`);
        return;
      }
      
      // If DB is empty, admin can seed it now
      if (restHouses.length === 0) {
        console.log("Seeding initial data to Firestore...");
        const batch = writeBatch(db);
        REST_HOUSES.forEach(h => {
          const restHouseRef = doc(db, 'restHouses', h.id);
          batch.set(restHouseRef, h);
        });
        await batch.commit();
        alert("Database seeded successfully! Your rest houses are now online.");
      } else {
        alert("Cloud Sync Activated! You can now save changes to the live database.");
      }
    } catch (error: any) {
      console.error("Cloud Activation Error Details:", error);
      if (error.code === 'permission-denied') {
        alert("Permission Denied: Your account doesn't have authority to write to the database. Ensure you use vasudoegar@gmail.com");
      } else if (error.code === 'auth/admin-restricted-operation') {
        alert("Auth Provider Error: This operation is restricted. Please ensure Google Login is enabled in your Firebase console.");
      } else {
        alert(`Cloud activation failed: ${error.message}`);
      }
    }
  };

  const [view, setView] = useState<View>('SPLASH');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = () => {
    const adminCreds = [
      { user: 'dfomandi', pass: '123456789' },
      { user: 'supmandi', pass: '12345678' }
    ];

    const isAdminLogin = adminCreds.find(c => c.user === loginUser && c.pass === loginPass);
    const isGuestLogin = loginUser === 'default' && loginPass === '12345';

    if (isAdminLogin) {
      setIsAdmin(true);
      setView('ADMIN_DASHBOARD');
      setLoginError(false);
    } else if (isGuestLogin) {
      setIsAdmin(false);
      setView('EXPLORE');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Edit form state
  const [editOccupant, setEditOccupant] = useState('');
  const [editReference, setEditReference] = useState('');
  const [editStatus, setEditStatus] = useState<Status>('AVAILABLE');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editSetName, setEditSetName] = useState('');
  const [editSetDesc, setEditSetDesc] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectedProperty = useMemo(() => 
    restHouses.find(h => h.id === selectedPropertyId), 
    [selectedPropertyId, restHouses]
  );

  const selectedSet = useMemo(() => 
    selectedProperty?.accommodationSets.find(s => s.id === selectedSetId),
    [selectedProperty, selectedSetId]
  );

  const filteredProperties = useMemo(() => 
    restHouses.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, restHouses]
  );

  const navigateToDetail = (id: string) => {
    setSelectedPropertyId(id);
    setView('DETAIL');
  };

  const navigateToSetDetail = (id: string) => {
    setSelectedSetId(id);
    setView('SET_DETAIL');
  };

  const navigateToAdminEdit = (propertyId: string, setId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedSetId(setId);
    const prop = restHouses.find(h => h.id === propertyId);
    const s = prop?.accommodationSets.find(set => set.id === setId);
    if (s) {
      setEditStatus(s.status);
      setEditSetName(s.name);
      setEditSetDesc(s.description);
    }
    setEditOccupant('');
    setEditReference('');
    setEditCheckIn('');
    setEditCheckOut('');
    setView('ADMIN_EDIT');
  };

  const handleSave = async () => {
    if (!selectedPropertyId || !selectedSetId) return;

    let updatedRestHouse: ForestRestHouse | undefined;

      if (editStatus === 'BOOKED') {
      if (!editCheckIn || !editCheckOut || !editOccupant) {
        alert("Please enter essential booking details: Guest Name and Booking Dates.");
        return;
      }

      const currentSet = selectedProperty?.accommodationSets.find(s => s.id === selectedSetId);
      if (currentSet) {
        const newStart = new Date(editCheckIn);
        const newEnd = new Date(editCheckOut);
        newStart.setHours(0,0,0,0);
        newEnd.setHours(0,0,0,0);

        const hasOverlap = currentSet.bookings.some(b => {
          const bStart = new Date(b.checkIn);
          const bEnd = new Date(b.checkOut);
          bStart.setHours(0,0,0,0);
          bEnd.setHours(0,0,0,0);
          // Inclusive date overlap: room is booked for the entire date.
          return (newStart <= bEnd && newEnd >= bStart);
        });

        if (hasOverlap) {
          alert("booking for some of these dates already done please select some other dates.");
          return;
        }

        const newBooking: BookingRecord = {
          id: Math.random().toString(36).substr(2, 9),
          occupant: editOccupant,
          reference: editReference,
          checkIn: editCheckIn,
          checkOut: editCheckOut
        };

        updatedRestHouse = restHouses.find(h => h.id === selectedPropertyId);
        if (updatedRestHouse) {
          updatedRestHouse = {
            ...updatedRestHouse,
            accommodationSets: updatedRestHouse.accommodationSets.map(s => {
              if (s.id === selectedSetId) {
                return {
                  ...s,
                  name: editSetName,
                  description: editSetDesc,
                  bookings: [...s.bookings, newBooking],
                  status: 'BOOKED'
                };
              }
              return s;
            })
          };
        }
      }
    } else {
      updatedRestHouse = restHouses.find(h => h.id === selectedPropertyId);
      if (updatedRestHouse) {
        updatedRestHouse = {
          ...updatedRestHouse,
          accommodationSets: updatedRestHouse.accommodationSets.map(s => {
            if (s.id === selectedSetId) {
              return { 
                ...s, 
                status: editStatus,
                name: editSetName,
                description: editSetDesc
              };
            }
            return s;
          })
        };
      }
    }

    if (updatedRestHouse) {
      try {
        await setDoc(doc(db, 'restHouses', selectedPropertyId), updatedRestHouse);
        setEditOccupant('');
        setEditReference('');
        setEditCheckIn('');
        setEditCheckOut('');
        setView('DETAIL');
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        alert("Failed to save changes. Please check your connection.");
      }
    }
  };

  const handleLogout = () => {
    setLoginUser('');
    setLoginPass('');
    setIsAdmin(false);
    setView('SPLASH');
  };

  // Nav Components
  const TopNav = ({ title, onBack, showProfile = true }: { title: string, onBack?: () => void, showProfile?: boolean }) => (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#18301d] shadow-lg">
      <div className="flex items-center gap-4">
        {onBack ? (
          <button onClick={onBack} className="text-[#f8faf9] hover:bg-white/10 p-2 rounded-xl transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <button onClick={handleLogout} title="Logout" className="text-[#f8faf9] hover:bg-white/10 p-2 rounded-xl transition-all active:scale-90 opacity-60 hover:opacity-100">
              <LogOut size={18} />
            </button>
          </div>
        )}
        <h1 className="text-[#f8faf9] font-bold tracking-tight text-lg">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {isAdmin && (
          <button 
            onClick={handleCloudSync}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tighter transition-all ${auth.currentUser ? 'bg-[#2e4632] text-[#f8faf9] border-transparent' : 'bg-[#ba1a1a] text-white border-transparent animate-pulse'}`}
          >
            <Globe size={12} />
            {auth.currentUser ? 'Sync Active' : 'Enable Sync'}
          </button>
        )}
        {showProfile && (
          <button 
            onClick={() => { setIsAdmin(!isAdmin); setView(isAdmin ? 'EXPLORE' : 'ADMIN_DASHBOARD'); }}
            className="w-10 h-10 rounded-full border-2 border-[#2e4632] overflow-hidden"
          >
            <img 
              src={isAdmin ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAFrsnDKcW6tKVEUptdF_R6uecETe__yaJwkHvLbGwuXs5SOi0yeZlaIUQ_yzo4OTKhA6nUr64Gzw0qhneQb0HU_IOSfAdjo5rAJZROqYNorGQJAS0fycWlaSnIV4IveFQJy5Gpt1q252iq8W2_i_V71GBe3ru0h6hTSICExvgI510xr4buysMJokM0yUmEswqDvh1PtbII65VRkwnTJU-zSnMBrEb7w5RNLzhFvF_ReG7SGEsdkKBBQY9-FGoltat6FRVcvo3DMAM" : "https://i.pravatar.cc/150?u=guest"} 
              alt="Profile" 
              referrerPolicy="no-referrer"
            />
          </button>
        )}
      </div>
    </header>
  );

  const BottomTab = ({ active }: { active: string }) => (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#f8faf9]/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      {[
        { id: 'explore', icon: Trees, label: 'Explore' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' }
      ].map((tab) => (
        <button 
          key={tab.id}
          className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${active === tab.id ? 'text-[#18301d]' : 'text-[#434842] opacity-60'}`}
          onClick={() => {
            if (tab.id === 'explore') setView('EXPLORE');
            if (tab.id === 'bookings') setView('BOOKINGS');
          }}
        >
          <tab.icon size={20} strokeWidth={active === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          {active === tab.id && <motion.div layoutId="tab-dot" className="w-1 h-1 rounded-full bg-[#18301d]" />}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="bg-[#f8faf9] min-h-screen text-[#191c1c] font-['Manrope'] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'SPLASH' && (
          <motion.main 
            key="splash"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center bg-[#f8faf9] px-6"
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#b2ceb3]/30 rounded-full blur-3xl animate-pulse" />
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-32 h-32 relative z-10 drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#18301d] uppercase tracking-widest mb-1">Syncing Database</h2>
                  <p className="text-[10px] font-bold text-[#737971] uppercase tracking-[0.2em]">Asia-Southeast1 Gateway</p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#18301d]/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b2ceb3] via-[#18301d] to-[#b2ceb3]" />
                
                <div className="flex justify-center mb-8">
                  <div className="p-1 rounded-full border-2 border-[#18301d]/10">
                    <img 
                      src="/logo.png" 
                      alt="HP Forest Logo" 
                      className="w-24 h-24 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-extrabold text-[#18301d] tracking-tight mb-2">Mandi Forest Division</h1>
                  <p className="text-[10px] text-[#737971] uppercase font-bold tracking-[0.2em]">Rest House Booking Portal</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#737971] ml-1">Username</label>
                    <input 
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      className="w-full h-14 px-6 bg-[#f2f4f3] rounded-xl border-none focus:ring-2 focus:ring-[#18301d] transition-all" 
                      placeholder="Enter your username" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#737971] ml-1">Password</label>
                    <input 
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full h-14 px-6 bg-[#f2f4f3] rounded-xl border-none focus:ring-2 focus:ring-[#18301d] transition-all" 
                      type="password" 
                      placeholder="••••••••" 
                    />
                  </div>
                  
                  {loginError && (
                    <p className="text-[10px] text-[#ba1a1a] font-bold uppercase tracking-widest text-center">Invalid credentials</p>
                  )}

                  <button 
                    onClick={handleLogin}
                    className="w-full h-14 bg-[#18301d] text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Login <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.main>
        )}

        {view === 'EXPLORE' && (
          <motion.main 
            key="explore"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="pt-24 pb-32 px-6 max-w-3xl mx-auto"
          >
            <TopNav title="Rest House Booking" />
            
            <div className="mb-12">
              <h2 className="text-4xl font-extrabold text-[#18301d] tracking-tighter leading-tight mb-8">
                Find your sanctuary in the <span className="text-[#b2ceb3]">deep woods.</span>
              </h2>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737971] transition-transform group-focus-within:scale-110" size={20} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-white shadow-sm rounded-2xl border-none focus:ring-2 focus:ring-[#18301d] transition-all" 
                  placeholder="Search rest houses, locations..." 
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredProperties.map(p => (
                <div key={p.id}>
                  <PropertyCard property={p} onClick={() => navigateToDetail(p.id)} />
                </div>
              ))}
            </div>
            
            <BottomTab active="explore" />
          </motion.main>
        )}

        {view === 'BOOKINGS' && (
          <motion.main 
            key="bookings"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pt-24 pb-32 px-6 max-w-4xl mx-auto"
          >
            <TopNav title="Reservation Network" />
            
            <div className="mb-12">
              <h2 className="text-4xl font-extrabold text-[#18301d] tracking-tighter leading-tight mb-4">
                Upcoming <span className="text-[#77574d]">Reservations.</span>
              </h2>
              <p className="text-[#434842] italic leading-relaxed opacity-70">Monitor the current occupancy and projected schedules across all gazetted rest houses.</p>
            </div>

            <BookingCalendar restHouses={restHouses} />
            
            <BottomTab active="bookings" />
          </motion.main>
        )}

        {view === 'DETAIL' && selectedProperty && (
          <motion.main 
            key="detail"
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
            className="pb-32"
          >
            <TopNav title="Property Details" onBack={() => setView('EXPLORE')} />
            
            <section className="relative w-full h-[350px] mb-[-40px]">
              <img src={selectedProperty.heroImage} alt={selectedProperty.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8faf9] via-transparent to-transparent" />
            </section>

            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#77574d] text-[10px] uppercase font-bold tracking-widest mb-2">
                    <MapPin size={16} /> {selectedProperty.location}
                  </div>
                  <h2 className="text-5xl font-extrabold text-[#18301d] tracking-tighter leading-tight">
                    {selectedProperty.name.split(' ').slice(0, 2).join(' ')}<br />{selectedProperty.name.split(' ').slice(2).join(' ')}
                  </h2>
                </div>

                <div className="bg-[#eceeed] p-8 rounded-2xl mt-4">
                  <p className="text-sm text-[#434842] leading-relaxed italic">
                    {selectedProperty.description}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6 pt-12">
              </div>
            </div>

            <section className="max-w-4xl mx-auto px-6 py-16">
              <h3 className="text-2xl font-bold text-[#18301d] mb-10 pl-4 border-l-4 border-[#18301d]">Accommodation Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedProperty.accommodationSets.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => isAdmin ? navigateToAdminEdit(selectedProperty.id, s.id) : navigateToSetDetail(s.id)} 
                    className="cursor-pointer"
                  >
                    <SetCard set={s} isAdmin={isAdmin} onEdit={() => navigateToAdminEdit(selectedProperty.id, s.id)} />
                  </div>
                ))}
              </div>
            </section>
          </motion.main>
        )}

        {view === 'SET_DETAIL' && selectedSet && selectedProperty && (
          <motion.main 
            key="set-detail"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="min-h-screen bg-[#f8faf9] flex flex-col"
          >
            <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/10 backdrop-blur-xl">
              <button onClick={() => setView('DETAIL')} className="text-white hover:bg-white/10 p-2 rounded-xl">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-white font-bold tracking-tight text-lg">{selectedProperty.name}</h1>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-10 h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </header>

            <div className="h-[40vh] relative">
              <img src={selectedProperty.heroImage} alt="Setup" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-10 left-6 right-6 lg:left-12 flex justify-between items-end">
                <div className="text-white">
                  <h2 className="text-5xl font-black">{selectedSet.name}</h2>
                  <p className="opacity-80 font-medium">{selectedSet.description}</p>
                </div>
                <StatusBadge status={selectedSet.status} />
              </div>
            </div>

            <div className="flex-1 bg-[#f8faf9] -mt-6 rounded-t-3xl p-8 max-w-4xl mx-auto w-full space-y-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#18301d]">The Environment</h3>
                <p className="text-[#434842] leading-loose text-sm italic">
                  Positioned on the edge of the clearing, {selectedSet.name} offers an uninterrupted, serene perspective of the sanctuary. The architecture remains intentionally minimal, allowing the dense canopy of ancient trees and the profound stillness to dominate the experience. Natural light filters through the foliage during dawn, casting a subtle warmth across the timbered interior.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Waves, label: 'View', value: selectedSet.view },
                  { icon: LayoutGrid, label: 'Level', value: selectedSet.floor + ' Floor' },
                  { icon: Bed, label: 'Capacity', value: selectedSet.capacity + ' Guests' }
                ].map((attr, i) => (
                  <div key={i} className="bg-[#f2f4f3] p-6 rounded-2xl flex flex-col gap-3">
                    <attr.icon size={24} className="text-[#18301d]" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#737971]">{attr.label}</span>
                      <p className="font-bold text-[#18301d]">{attr.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSet.bookings.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#18301d]">Usage Schedule</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedSet.bookings.map(b => (
                      <div key={b.id} className="bg-[#f2f4f3] p-8 rounded-2xl flex flex-col sm:flex-row gap-8 justify-between border border-black/5 hover:border-[#18301d]/20 transition-all">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#737971]">Stay From</span>
                          <div className="flex items-center gap-3 text-[#18301d]">
                            <Calendar size={18} className="opacity-40" />
                            <p className="font-bold text-lg">{b.checkIn}</p>
                          </div>
                        </div>
                        <div className="w-px h-full bg-black/5 hidden sm:block" />
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#737971]">Stay To</span>
                          <div className="flex items-center gap-3 text-[#18301d]">
                            <Calendar size={18} className="opacity-40" />
                            <p className="font-bold text-lg">{b.checkOut}</p>
                          </div>
                        </div>
                        <div className="w-px h-full bg-black/5 hidden sm:block" />
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#737971]">Guest Detail</span>
                          <div className="flex items-center gap-3 text-[#18301d]">
                            <User size={18} className="opacity-40" />
                            <p className="font-bold text-lg">{b.occupant}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#eceeed] p-8 rounded-2xl flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#737971]">Atmosphere Index</h4>
                  <p className="text-2xl font-black text-[#18301d]">9.4 DEEP CALM</p>
                </div>
                <div className="flex gap-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className={`h-2 flex-1 rounded-sm ${i <= 5 ? 'bg-[#0f2e3a]' : 'bg-black/10'}`} />)}
                </div>
                <p className="text-xs text-[#434842] leading-relaxed">Exceptional isolation. Minor natural ambient noise. Ideal for digital detox.</p>
              </div>

              {selectedSet.status === 'AVAILABLE' && (
                <button className="w-full bg-[#18301d] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#18301d]/20 active:scale-95 transition-all">
                  BOOK NOW
                </button>
              )}
            </div>
          </motion.main>
        )}

        {view === 'ADMIN_DASHBOARD' && (
          <motion.main 
            key="admin-dash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen pt-24 pb-12"
          >
            <TopNav title="Forest Admin" />
            
            <div className="p-6 md:p-12 w-full max-w-7xl mx-auto mt-4">
              <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-l-4 border-[#18301d] pl-6">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-[#18301d] mb-4">Manage Assets</h2>
                  <p className="text-[#434842] max-w-2xl leading-relaxed italic opacity-70">Review current availability and coordinate guest schedules across the forest network.</p>
                </div>
                {!auth.currentUser && (
                  <button 
                    onClick={handleCloudSync}
                    className="flex shrink-0 items-center gap-3 px-6 py-4 bg-white border-2 border-[#ba1a1a] rounded-2xl animate-pulse transition-all hover:bg-red-50 group"
                  >
                    <Globe size={18} className="text-[#ba1a1a]" />
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#ba1a1a]">Activate Cloud Sync</p>
                      <p className="text-[8px] font-bold opacity-40 normal-case">Identity Verification Required</p>
                    </div>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {restHouses.map(h => (
                  <div key={h.id} className="bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow group">
                    <div className="h-48 sm:h-auto sm:w-1/3 relative">
                      <img src={h.heroImage} alt={h.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-md text-[8px] font-black tracking-widest uppercase">ACTIVE</div>
                    </div>
                    <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-[#18301d] mb-1">{h.name}</h3>
                        <p className="text-xs text-[#434842] line-clamp-2 italic mb-4 opacity-70">{h.description}</p>
                        <div className="mb-6 space-y-2">
                          <div className="flex justify-between items-end text-[10px] font-black tracking-widest opacity-60">
                            <span>OCCUPANCY</span>
                            <span>85%</span>
                          </div>
                          <div className="flex h-1.5 gap-0.5 w-full bg-[#f2f4f3] rounded-full overflow-hidden">
                            {[1,2,3,4].map(i => <div key={i} className={`h-full flex-1 ${i <= 3 ? 'bg-[#0f2e3a]' : 'bg-black/10'}`} />)}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigateToDetail(h.id)}
                        className="w-full bg-[#18301d] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-between px-6 transition-all hover:opacity-90 active:scale-95"
                      >
                        Manage Sets <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <BottomTab active="bookings" />
          </motion.main>
        )}

        {view === 'ADMIN_EDIT' && selectedSet && selectedProperty && (
          <motion.main 
            key="admin-edit"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="pt-24 pb-12 px-6 max-w-5xl mx-auto"
          >
            <TopNav title="Update Status" onBack={() => setView('DETAIL')} />
            
            <div className="mb-10">
              <div className="flex items-center gap-2 text-[#737971] text-[10px] uppercase font-bold tracking-widest mb-2">
                Dashboard <ChevronRight size={12} /> <span className="text-[#18301d]">{selectedProperty.name}</span>
              </div>
              <h2 className="text-4xl font-black text-[#18301d] tracking-tight">Update Status: {selectedSet.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7 bg-[#f2f4f3] p-10 rounded-2xl space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase text-[#737971]">General Details</label>
                  <div className="grid grid-cols-1 gap-4">
                    <input 
                      className="w-full h-14 px-6 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#18301d]" 
                      value={editSetName}
                      onChange={(e) => setEditSetName(e.target.value)}
                      placeholder="Set Name (e.g. Set 1)"
                    />
                    <textarea 
                      className="w-full p-6 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#18301d] h-32" 
                      value={editSetDesc}
                      onChange={(e) => setEditSetDesc(e.target.value)}
                      placeholder="Set Description"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest uppercase text-[#737971]">Booking Status</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['BOOKED', 'AVAILABLE'] as Status[]).map((s) => (
                      <button 
                        key={s}
                        onClick={() => setEditStatus(s)}
                        className={`py-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${editStatus === s ? 'border-[#18301d] bg-white font-black' : 'border-transparent bg-black/5 text-[#434842] opacity-60'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${s === 'BOOKED' ? 'bg-[#ba1a1a]' : 'bg-[#18301d]'}`} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/50 p-8 rounded-2xl border border-[#18301d]/10 space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-[#18301d] uppercase tracking-widest mb-1">Booking dates</h3>
                    <p className="text-[10px] text-[#737971] italic">Please select dates for which room is required.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest uppercase text-[#434842]">From Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737971]" size={18} />
                        <input 
                          type="date"
                          className="w-full h-14 pl-12 pr-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#18301d] text-sm" 
                          value={editCheckIn}
                          onChange={(e) => setEditCheckIn(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest uppercase text-[#434842]">To Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737971]" size={18} />
                        <input 
                          type="date"
                          className="w-full h-14 pl-12 pr-4 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#18301d] text-sm" 
                          value={editCheckOut}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-[#434842]">Guest Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737971]" />
                      <input 
                        className="w-full h-14 pl-12 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#18301d]" 
                        value={editOccupant}
                        onChange={(e) => setEditOccupant(e.target.value)}
                        placeholder="Enter guest name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-[#434842]">Reference Officer</label>
                    <div className="relative">
                      <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737971]" />
                      <input 
                        className="w-full h-14 pl-12 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#18301d]" 
                        value={editReference}
                        onChange={(e) => setEditReference(e.target.value)}
                        placeholder="Enter reference"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    onClick={handleSave}
                    className="flex-1 h-14 bg-[#18301d] text-white font-black rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> SAVE & PUBLISH
                  </button>
                  <button onClick={() => setView('DETAIL')} className="h-14 px-10 bg-[#fed3c7] text-[#77574d] font-black rounded-xl hover:opacity-90">CANCEL</button>
                </div>

                {selectedSet.bookings.length > 0 && (
                  <div className="pt-8 border-t border-black/5 mt-8">
                    <h4 className="text-[10px] font-black tracking-widest uppercase text-[#737971] mb-6">Existing Bookings for this Set</h4>
                    <div className="space-y-4">
                      {selectedSet.bookings.map(b => (
                        <div key={b.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-bold text-[#18301d] text-sm">{b.occupant}</p>
                            <p className="text-[10px] text-[#434842] opacity-60 font-medium">
                              {b.checkIn} — {b.checkOut}
                            </p>
                          </div>
                          {confirmDeleteId === b.id ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] font-bold uppercase tracking-widest text-[#737971] hover:text-[#18301d] px-2 py-1"
                              >
                                No
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirmDeleteId === b.id) {
                                    const house = restHouses.find(h => h.id === selectedPropertyId);
                                    if (house) {
                                      const updatedHouse = {
                                        ...house,
                                        accommodationSets: house.accommodationSets.map(s => {
                                          if (s.id === selectedSetId) {
                                            const updatedBookings = s.bookings.filter(bk => bk.id !== b.id);
                                            return {
                                              ...s,
                                              bookings: updatedBookings,
                                              status: updatedBookings.length === 0 ? 'AVAILABLE' : s.status
                                            };
                                          }
                                          return s;
                                        })
                                      };
                                      try {
                                        await setDoc(doc(db, 'restHouses', selectedPropertyId!), updatedHouse);
                                        setConfirmDeleteId(null);
                                      } catch (error) {
                                        console.error("Error deleting from Firebase:", error);
                                        alert("Failed to cancel booking.");
                                      }
                                    }
                                  }
                                }}
                                className="bg-[#ba1a1a] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:opacity-90"
                              >
                                Confirm Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmDeleteId(b.id)}
                              className="flex items-center gap-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/5 px-3 py-2 rounded-lg transition-colors group"
                              title="Cancel Booking"
                            >
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cancel</span>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-48 relative">
                    <img src={selectedProperty.heroImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-[#18301d] text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">LIVE PREVIEW</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{selectedProperty.name}</h3>
                    <p className="text-xs text-[#434842] italic opacity-60 leading-relaxed">Changes saved here will be immediately published and visible to all users across the booking portal.</p>
                  </div>
                </div>
                
                <div className="bg-[#eceeed] p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-[#18301d] font-bold text-sm">
                    <Info size={16} /> Admin Guidelines
                  </div>
                  <ul className="text-[10px] text-[#434842] leading-relaxed space-y-2 font-medium opacity-80">
                    <li>• Verify Guest ID during check-in if status is updated to 'Booked'.</li>
                    <li>• Reference Officer name is mandatory for VIP quota allocations.</li>
                    <li>• Updates reflect instantly across all front-end booking portals.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
