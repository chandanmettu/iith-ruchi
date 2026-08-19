import { MessHallDetails, DailyMenu, StudentProfile, RegistrationWindow, MessSwapOffer } from '../types/mess';

export const INITIAL_MESS_DATA: MessHallDetails[] = [
  {
    id: 'Mess A',
    displayName: 'Mess A (Old Mess)',
    subtitle: 'Classic South & North Fusion Caterers',
    caterer: 'SRI KRISHNA CATERERS PVT LTD',
    location: 'Near Old Hostel Block & Gymkhana Grounds',
    rating: 4.6,
    totalCapacity: 2000,
    sections: {
      UHD: {
        capacity: 1000,
        filled: 842,
        label: 'Upper Dining Hall (UHD)'
      },
      LHD: {
        capacity: 1000,
        filled: 915,
        label: 'Lower Dining Hall (LHD)'
      }
    },
    specialties: ['Ghee Dosa Counter', 'Live Paneer & Chana Station', 'Hyderabadi Biryani Thursdays', 'Unlimited Ice Creams'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'Mess B',
    displayName: 'Mess B (New Mess)',
    subtitle: 'Modern Multi-Cuisine Dining Complex',
    caterer: 'DELIGHT HOSPITALITY SERVICES',
    location: 'Adjacent to Academic Block & Knowledge Hub',
    rating: 4.8,
    totalCapacity: 2000,
    sections: {
      UHD: {
        capacity: 1000,
        filled: 954,
        label: 'Upper Dining Hall (UHD)'
      },
      LHD: {
        capacity: 1000,
        filled: 688,
        label: 'Lower Dining Hall (LHD)'
      }
    },
    specialties: ['Wood-Fired Parathas', 'Fresh Juice & Fruit Counter', 'Chef Special Chinese Combo', 'High Protein Diet Section'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_REGISTRATION_WINDOW: RegistrationWindow = {
  month: 'August 2026',
  year: 2026,
  isOpen: true,
  opensAt: '2026-07-28T00:00:00.000Z',
  closesAt: '2026-08-05T23:59:59.000Z',
  totalRegistered: 3399,
  totalCap: 4000
};

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    email: 'cs21btech11001@iith.ac.in',
    rollNo: 'CS21BTECH11001',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    hostelBlock: 'Ramanujan Block (B-04)',
    roomNo: '412',
    registeredMess: 'Mess A',
    diningHall: 'UHD',
    bookingTimestamp: '2026-07-29T10:14:22Z',
    ticketId: 'IITH-AUG26-A-UHD-4129',
    qrCodeValue: 'IITH|CS21BTECH11001|Mess A|UHD|2026-08',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    isIITHMail: true
  },
  {
    id: '2',
    name: 'Ananya Reddy',
    email: 'ee22mtech12004@iith.ac.in',
    rollNo: 'EE22MTECH12004',
    department: 'Electrical Engineering',
    degree: 'M.Tech',
    hostelBlock: 'Aryabhata Block (B-02)',
    roomNo: '208',
    registeredMess: 'Mess B',
    diningHall: 'LHD',
    bookingTimestamp: '2026-07-29T11:45:01Z',
    ticketId: 'IITH-AUG26-B-LHD-8812',
    qrCodeValue: 'IITH|EE22MTECH12004|Mess B|LHD|2026-08',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    isIITHMail: true
  },
  {
    id: '3',
    name: 'Siddharth Verma',
    email: 'ai23btech11015@iith.ac.in',
    rollNo: 'AI23BTECH11015',
    department: 'Artificial Intelligence',
    degree: 'B.Tech',
    hostelBlock: 'Kalam Block (B-06)',
    roomNo: '105',
    registeredMess: null,
    diningHall: null,
    bookingTimestamp: null,
    ticketId: null,
    qrCodeValue: null,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    isIITHMail: true
  }
];

export const WEEKLY_MENUS: DailyMenu[] = [
  {
    day: 'Monday',
    dateStr: 'August 3, 2026',
    messA: [
      { id: 'ma-m-1', session: 'Breakfast', timing: '07:30 AM - 09:30 AM', items: ['Idli & Medu Vada', 'Sambar & Coconut Chutney', 'Bread, Jam & Butter', 'Tea / Coffee / Milk', 'Sprouts'] },
      { id: 'ma-m-2', session: 'Lunch', timing: '12:00 PM - 02:15 PM', items: ['Jeera Rice & Chapati', 'Dal Tadka', 'Aloo Gobi Dry', 'Curd & Salad', 'Pickle & Papad'] },
      { id: 'ma-m-3', session: 'Snacks', timing: '05:00 PM - 06:15 PM', items: ['Samosa Chat', 'Green Chutney', 'Tea & Coffee'] },
      { id: 'ma-m-4', session: 'Dinner', timing: '07:30 PM - 09:30 PM', items: ['Veg Kolhapuri', 'Butter Naan / Phulka', 'Steamed Rice & Rasam', 'Gulab Jamun', 'Milk'] }
    ],
    messB: [
      { id: 'mb-m-1', session: 'Breakfast', timing: '07:30 AM - 09:30 AM', items: ['Masala Dosa', 'Alugadda Kurma', 'Cornflakes & Hot Milk', 'Tea / Coffee / Juice', 'Boiled Eggs'] },
      { id: 'mb-m-2', session: 'Lunch', timing: '12:00 PM - 02:15 PM', items: ['Veg Pulao', 'Paneer Butter Masala', 'Gujarati Kadhi', 'Fresh Garden Salad', 'Fruit Custard'] },
      { id: 'mb-m-3', session: 'Snacks', timing: '05:00 PM - 06:15 PM', items: ['Paneer Bread Pakoda', 'Tomato Ketchup', 'Special Filter Coffee & Tea'] },
      { id: 'mb-m-4', session: 'Dinner', timing: '07:30 PM - 09:30 PM', items: ['Kadai Mushroom', 'Tandoori Roti', 'Lemon Rice & Curd Rice', 'Brownie with Chocolate Sauce'] }
    ]
  },
  {
    day: 'Wednesday',
    dateStr: 'August 5, 2026',
    messA: [
      { id: 'ma-w-1', session: 'Breakfast', timing: '07:30 AM - 09:30 AM', items: ['Uttapam with Tomato Chutney', 'Poori Masala', 'Oats Porridge', 'Fruits & Tea'] },
      { id: 'ma-w-2', session: 'Lunch', timing: '12:00 PM - 02:15 PM', items: ['Veg Dum Biryani', 'Mirchi Ka Salan', 'Onion Raita', 'Sweet Lassi'] },
      { id: 'ma-w-3', session: 'Snacks', timing: '05:00 PM - 06:15 PM', items: ['Pav Bhaji', 'Lemon Tea'] },
      { id: 'ma-w-4', session: 'Dinner', timing: '07:30 PM - 09:30 PM', items: ['Rajma Masala', 'Phulka & Steamed Rice', 'Sambhar & Pickle', 'Rasgulla'] }
    ],
    messB: [
      { id: 'mb-w-1', session: 'Breakfast', timing: '07:30 AM - 09:30 AM', items: ['Aloo Paratha with White Butter', 'Boiled Sprouts & Eggs', 'Milkshake', 'Coffee'] },
      { id: 'mb-w-2', session: 'Lunch', timing: '12:00 PM - 02:15 PM', items: ['Chole Bhature', 'Veg Pulao', 'Curd Rice & Pickle', 'Ice Cream Cup'] },
      { id: 'mb-w-3', session: 'Snacks', timing: '05:00 PM - 06:15 PM', items: ['Bhel Puri', 'Cold Coffee'] },
      { id: 'mb-w-4', session: 'Dinner', timing: '07:30 PM - 09:30 PM', items: ['Special Hyderabadi Chicken Biryani / Paneer Biryani', 'Salad & Raita', 'Double Ka Meetha'] }
    ]
  }
];

export const INITIAL_SWAP_REQUESTS: MessSwapOffer[] = [
  {
    id: 'swap-1',
    studentName: 'Rohan Gupta',
    rollNo: 'ME22BTECH11044',
    currentMess: 'Mess A',
    targetMess: 'Mess B',
    currentHall: 'UHD',
    targetHall: 'UHD',
    contactEmail: 'me22btech11044@iith.ac.in',
    createdAt: '2026-07-29T14:20:00Z',
    status: 'open'
  },
  {
    id: 'swap-2',
    studentName: 'Sneha Patel',
    rollNo: 'CL23BTECH11002',
    currentMess: 'Mess B',
    targetMess: 'Mess A',
    currentHall: 'LHD',
    targetHall: 'UHD',
    contactEmail: 'cl23btech11002@iith.ac.in',
    createdAt: '2026-07-29T16:05:00Z',
    status: 'open'
  }
];
