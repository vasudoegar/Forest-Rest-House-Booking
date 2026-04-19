import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon, User, ShieldCheck } from 'lucide-react';

import { ForestRestHouse } from '../types';

interface Reservation {
  id: string;
  propertyName: string;
  guestName: string;
  reference: string;
  checkIn: Date;
  checkOut: Date;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'BOOKED' | 'AVAILABLE';
}

export function BookingCalendar({ restHouses }: { restHouses: ForestRestHouse[] }) {
  const today = new Date(2026, 3, 19); 
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 3, 1));
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // Derive reservations from restHouses state
  const reservations = React.useMemo(() => {
    const list: Reservation[] = [];
    restHouses.forEach(h => {
      h.accommodationSets.forEach(s => {
        s.bookings.forEach(b => {
          list.push({
            id: b.id,
            propertyName: h.name,
            guestName: b.occupant,
            reference: b.reference,
            checkIn: new Date(b.checkIn),
            checkOut: new Date(b.checkOut),
            status: 'BOOKED'
          });
        });
      });
    });
    return list;
  }, [restHouses]);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getReservationsForDay = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return reservations.filter(res => {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      checkIn.setHours(0,0,0,0);
      checkOut.setHours(0,0,0,0);
      d.setHours(0,0,0,0);
      return d >= checkIn && d <= checkOut;
    });
  };

  const selectedDayReservations = selectedDay ? getReservationsForDay(selectedDay) : [];

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(25,28,28,0.04)] border border-black/5">
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-[#18301d] tracking-tighter">{monthName} {year}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#737971] mt-1">Availability Overview</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prevMonth}
              className="p-3 bg-[#f2f4f3] rounded-xl hover:bg-[#e1e3e2] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-3 bg-[#f2f4f3] rounded-xl hover:bg-[#e1e3e2] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-[10px] font-black uppercase text-[#737971] text-center tracking-widest pb-4">{day}</div>
          ))}
          {emptyDays.map((i) => <div key={`empty-${i}`} />)}
          {days.map((day) => {
            const res = getReservationsForDay(day);
            const active = res.length > 0;
            const current = isToday(day);
            
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDay(day)}
                className={`relative aspect-square flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                  selectedDay === day ? 'ring-2 ring-[#18301d] bg-[#f2f4f3] scale-105' : 
                  current ? 'bg-[#18301d] text-white shadow-lg z-10' : 
                  active ? 'bg-[#fed3c7] text-[#77574d] hover:bg-[#fcc3b6]' : 
                  'text-[#434842] hover:bg-[#f2f4f3]'
                } cursor-pointer group`}
              >
                {day}
                {active && !current && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#77574d]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-[#18301d] pl-4 border-l-4 border-[#b2ceb3]">
          {selectedDay 
            ? `Reservations for ${selectedDay} ${monthName}` 
            : 'Coming Up Next'}
        </h3>
        <div className="space-y-4">
          {(selectedDay ? selectedDayReservations : reservations).length > 0 ? (
            (selectedDay ? selectedDayReservations : reservations).map(res => (
              <motion.div 
                key={res.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between gap-6"
              >
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-[#eceeed] rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-[#737971] leading-none mb-1">{res.checkIn.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-black text-[#18301d] leading-none">{res.checkIn.getDate()}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-lg font-bold text-[#18301d] leading-tight mb-1">{res.propertyName}</h4>
                    <div className="flex items-center gap-3 text-xs text-[#434842]">
                      <div className="flex items-center gap-1"><User size={14} className="opacity-60" /> {res.guestName}</div>
                      <div className="flex items-center gap-1"><ShieldCheck size={14} className="opacity-60" /> {res.reference}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center sm:pr-4">
                  <div className="px-4 py-2 bg-[#eceeed] rounded-full text-[10px] font-black text-[#18301d] tracking-widest">
                    {res.status}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-[#18301d]/20 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-[#f2f4f3] rounded-full mb-4">
                <CalendarIcon size={32} className="text-[#18301d] opacity-40" />
              </div>
              <p className="text-[#18301d] font-bold">No reservations found</p>
              <p className="text-xs text-[#434842] opacity-60">Try selecting another date or check the upcoming schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
