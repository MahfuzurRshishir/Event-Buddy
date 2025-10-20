export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; 
  time: string;
  location: string;
  capacity: number;
  seatsLeft: number;
  tags: string[];
  imageUrl?: string;
}

export interface Booking {
  eventId: string;
  userId: string;
  seatsBooked: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}