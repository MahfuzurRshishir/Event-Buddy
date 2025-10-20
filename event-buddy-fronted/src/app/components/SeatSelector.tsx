type Props = {
  selected: number;
  onSelect: (count: number) => void;
};

const SeatSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-2">
  {[1, 2, 3, 4].map((count: number) => (
        <button
          key={count}
          onClick={() => onSelect(count)}
          className={`px-4 py-2 border rounded ${selected === count ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
        >
          {count} Seat{count > 1 ? 's' : ''}
        </button>
      ))}
    </div>
  );
};

