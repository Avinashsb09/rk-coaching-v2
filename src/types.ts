/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'visitor' | 'student' | 'teacher' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  dailyStreak: number;
  totalXp: number;
  badges: string[];
  classId?: string | null;
  phone?: string | null;
  schoolName?: string | null;
  address?: string | null;
  state?: string | null;
  district?: string | null;
}

export interface AcademicClass {
  id: string;
  name: string;
  slug: string;
  priority: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicSubject {
  id: string;
  classId: string;
  name: string;
  icon: string;
  description: string;
  displayOrder?: number;
  isActive?: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicChapter {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  orderIndex: number;
  isActive?: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  isPremium: boolean;
  price: number;
  discountPrice?: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  isPremium: boolean;
}

export interface Video {
  id: string;
  lessonId: string;
  title: string;
  provider: 'youtube' | 'gdrive' | 'vimeo' | 'supabase' | 'r2';
  videoIdOrUrl: string;
  durationSeconds: number;
  displayOrder?: number;
  classId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  status?: 'draft' | 'review' | 'published' | 'archived';
  description?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  lessonId?: string | null;
  classId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  type?: 'notes' | 'pyq' | 'practiceset';
  title: string;
  pdfUrl: string;
  sizeBytes: number;
  isPremium: boolean;
  price?: number | null;
  displayOrder?: number;
  status?: 'draft' | 'review' | 'published' | 'archived';
  examName?: string;
  year?: number;
  solvedStatus?: 'solved' | 'unsolved';
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScorePct: number;
  timerSeconds: number;
  classId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'draft' | 'review' | 'published' | 'archived';
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  orderIndex: number;
}

export interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  scoreObtained: number;
  totalQuestions: number;
  isPassed: boolean;
  attemptedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  pointsXp: number;
  rank: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  actionUrl: string;
  isActive: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRoles: UserRole[];
  isPinned: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  orderIndex: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  targetType: 'course' | 'lesson' | 'note';
  targetId: string;
  title: string;
  createdAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId?: string;
  lessonId: string;
  watchedPercentage: number;
  isCompleted: boolean;
  studyTimeSeconds: number;
  lastAccessedAt: string;
}

export interface Order {
  id: string; // Razorpay Order ID or UUID
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Payment {
  id: string; // Razorpay Payment ID or UUID
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface PaymentSettings {
  razorpayKeyId: string;
  businessName: string;
  businessLogo: string;
  supportEmail: string;
  supportPhone: string;
  successMessage: string;
  failureMessage: string;
}


