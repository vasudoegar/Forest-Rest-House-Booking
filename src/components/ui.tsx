import React from 'react';
import { motion } from 'motion/react';
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
  FileText
} from 'lucide-react';
import { ForestRestHouse, AccommodationSet, Status } from '../types';

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split(/[/-]/);
  let d: Date;
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD or YYYY/MM/DD
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      // DD-MM-YYYY or DD/MM/YYYY
      d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (date: Date | null | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// Status Badge Component
export function StatusBadge({ status }: { status: Status }) {
  const config = {
    AVAILABLE: { bg: 'bg-[#cdeace]', text: 'text-[#08200f]', dot: 'bg-[#18301d]', label: 'Available' },
    BOOKED: { bg: 'bg-[#ffdad6]', text: 'text-[#93000a]', dot: 'bg-[#ba1a1a]', label: 'Booked' },
    PARTIAL: { bg: 'bg-[#fff4d6]', text: 'text-[#856404]', dot: 'bg-[#ffc107]', label: 'Partially Booked' },
    MAINTENANCE: { bg: 'bg-[#e1e3e2]', text: 'text-[#434842]', dot: 'bg-[#737971]', label: 'Maintenance' },
  };
  
  const { bg, text, dot, label } = config[status];
  
  return (
    <div className={`${bg} ${text} text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit`}>
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </div>
  );
}

// Property Card Component
export function PropertyCard({ property, onClick }: { property: ForestRestHouse, onClick: () => void }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const totalSets = property.accommodationSets.length;
  const occupiedSets = property.accommodationSets.filter(set => 
    set.bookings.some(booking => {
      const start = parseDate(booking.checkIn);
      const end = parseDate(booking.checkOut);
      return start && end && today >= start && today <= end;
    })
  ).length;

  const occupancyPercent = totalSets > 0 ? Math.round((occupiedSets / totalSets) * 100) : 0;

  const getDisplayStatus = () => {
    if (occupiedSets === totalSets && totalSets > 0) return 'BOOKED';
    if (occupiedSets > 0) return 'PARTIAL';
    return 'AVAILABLE';
  };

  return (
    <motion.article 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_24px_rgba(25,28,28,0.04)] mb-8"
    >
      <div className="h-64 relative overflow-hidden">
        <img 
          src={property.heroImage} 
          alt={property.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <StatusBadge status={getDisplayStatus()} />
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#18301d]">{property.name}</h3>
          <span className="text-[10px] font-bold text-[#737971] uppercase tracking-widest">{occupancyPercent}% OCCUPANCY</span>
        </div>
        <p className="text-sm text-[#434842] line-clamp-2 leading-relaxed mb-6 italic">
          {property.description}
        </p>
        <button className="w-full bg-[#eceeed] text-[#18301d] font-bold py-3 rounded-xl hover:bg-[#d8dad9] transition-colors">
          VIEW DETAILS
        </button>
      </div>
    </motion.article>
  );
}

// Set Card Component
export function SetCard({ set, isAdmin = false, onEdit }: { set: AccommodationSet, isAdmin?: boolean, onEdit?: () => void }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const activeBookings = set.bookings.filter(b => {
    const end = parseDate(b.checkOut);
    return end && end >= today;
  });
  const nextBooking = activeBookings.length > 0 ? activeBookings[0] : null;

  const isBookedToday = set.bookings.some(b => {
    const start = parseDate(b.checkIn);
    const end = parseDate(b.checkOut);
    return start && end && today >= start && today <= end;
  });

  return (
    <article className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(25,28,28,0.04)] flex flex-col gap-6 relative group">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xl font-bold text-[#18301d]">{set.name}</h4>
          <p className="text-xs text-[#434842] mt-1 uppercase tracking-wider font-medium">{set.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={isBookedToday ? 'BOOKED' : 'AVAILABLE'} />
          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 bg-[#f2f4f3] rounded-lg text-[#18301d] hover:bg-[#e6e9e8] transition-colors"
            >
              <FileText size={18} />
            </button>
          )}
        </div>
      </div>

      {nextBooking ? (
        <div className="bg-[#f8faf9] p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[#191c1c]">
            <div className="w-8 h-8 rounded-full bg-[#fed3c7] flex items-center justify-center text-[#77574d]">
              <User size={18} />
            </div>
            <span className="text-sm font-bold">{nextBooking.occupant} {activeBookings.length > 1 && `(+${activeBookings.length - 1} more)`}</span>
          </div>
          <div className="flex items-center gap-3 text-[#434842] ml-1">
            <ShieldCheck size={18} className="opacity-70" />
            <span className="text-xs font-medium tracking-wide">Ref: {nextBooking.reference}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-black/5 flex justify-between items-center text-[10px] text-[#434842] uppercase tracking-[0.1em] font-bold">
            <span>UPCOMING IN</span>
            <span>{formatDate(nextBooking.checkIn)}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-end">
          <p className="text-sm text-[#434842] italic opacity-60">Ready for immediate authorization.</p>
        </div>
      )}
    </article>
  );
}
