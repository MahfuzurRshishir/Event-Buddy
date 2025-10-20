import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';

type Props = {
  title: string;
  date: string;
  location: string;
  seatsLeft: number;
  onClick: () => void;
  imageUrl?: string;
  time?: string;
  totalSeats?: number;
  tags?: string[];
  description?: string;
};

const EventCard: React.FC<Props> = ({
  title,
  date,
  location,
  seatsLeft,
  onClick,
  imageUrl,
  time,
  totalSeats,
  tags,
  description,
}) => {
  const dateObj = new Date(date);
  const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const day = dateObj.toLocaleDateString(undefined, { day: '2-digit' });

  return (
    <div
      className="shadow-xl hover:shadow-2xl drop-shadow-2xl hover:drop-shadow-2xl transition-shadow overflow-visible bg-white cursor-pointer" style={{
        clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
        WebkitClipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)'
      }}
      onClick={onClick}
    >
      {/* Image */}
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
      )}

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-1">
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-indigo-50 text-indigo-700 leading-tight text-xs">
            <span className="font-bold">{month}</span>
            <span className="-mt-1">{day}</span>
          </div>
          <h3 className="text-lg font-semibold text-indigo-950">{title}</h3>
        </div>

        {description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-indigo-900 mb-2">
          <span className="flex items-center gap-1"><FiCalendar /> {dateObj.toLocaleDateString(undefined, { weekday: 'long' })}</span>
          {time && <span className="flex items-center gap-1"><FiClock /> {time}</span>}
          <span className="flex items-center gap-1"><FiMapPin /> {location}</span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] text-indigo-700">
            {tags.slice(0, 3).map((t, i) => (
              <span key={`${t}-${i}`} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Divider before footer */}
      <div className="mt-3 mx-6 border-t border-gray-200" />

      {/* Footer */}
      <div className="flex items-center justify-between text-[12px] text-indigo-900 px-6 py-2">
        <span className="flex items-center gap-1"><FiUsers className="text-blue-600" /> {seatsLeft} Spots Left</span>
        {typeof totalSeats === 'number' && (
          <span className="opacity-80">Total {totalSeats} Seats</span>
        )}
      </div>
    </div>
  );
};

export default EventCard;