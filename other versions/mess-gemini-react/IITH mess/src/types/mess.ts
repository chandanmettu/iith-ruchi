export type MessType = 'Mess A' | 'Mess B';
export type DiningHallType = 'UHD' | 'LHD';
export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
export type UserRole = 'student' | 'caterer' | 'admin';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  degree: string;
  hostelBlock: string;
  roomNo: string;
  registeredMess: MessType | null;
  diningHall: DiningHallType | null;
  bookingTimestamp: string | null;
  ticketId: string | null;
  qrCodeValue: string | null;
  avatarUrl: string;
  isIITHMail: boolean;
}

export interface MessHallDetails {
  id: MessType;
  displayName: string;
  subtitle: string;
  caterer: string;
  location: string;
  rating: number;
  totalCapacity: number; // e.g. 2000 total (1000 UHD, 1000 LHD)
  sections: {
    UHD: {
      capacity: number; // 1000
      filled: number;
      label: string; // Upper Dining Hall
    };
    LHD: {
      capacity: number; // 1000
      filled: number;
      label: string; // Lower Dining Hall
    };
  };
  specialties: string[];
  image: string;
}

export interface MealItem {
  id: string;
  session: MealType;
  timing: string;
  items: string[];
  caloriesEstimate?: number;
  isSpecialMenu?: boolean;
}

export interface DailyMenu {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateStr: string;
  messA: MealItem[];
  messB: MealItem[];
}

export interface ScanVerificationResult {
  status: 'valid' | 'invalid' | 'already_scanned' | 'wrong_mess' | 'not_registered';
  student?: StudentProfile;
  scannedAt: string;
  scannedMeal: MealType;
  message: string;
  messName: MessType;
}

export interface MessSwapOffer {
  id: string;
  studentName: string;
  rollNo: string;
  currentMess: MessType;
  targetMess: MessType;
  currentHall: DiningHallType;
  targetHall: DiningHallType;
  contactEmail: string;
  createdAt: string;
  status: 'open' | 'accepted' | 'closed';
}

export interface RegistrationWindow {
  month: string;
  year: number;
  isOpen: boolean;
  opensAt: string; // ISO string
  closesAt: string; // ISO string
  totalRegistered: number;
  totalCap: number;
}
