import { AcademicClass, AcademicSubject, Course, AcademicChapter, Lesson, Video, Note, Announcement, Banner } from '../types';

export const mockClasses: AcademicClass[] = [
  { id: 'c6', name: 'Class 6', slug: 'class-6', priority: 1 },
  { id: 'c7', name: 'Class 7', slug: 'class-7', priority: 2 },
  { id: 'c8', name: 'Class 8', slug: 'class-8', priority: 3 },
  { id: 'c9', name: 'Class 9', slug: 'class-9', priority: 4 },
  { id: 'c10', name: 'Class 10', slug: 'class-10', priority: 5 },
  { id: 'c11_sci', name: 'Class 11 Science', slug: 'class-11-science', priority: 6 },
  { id: 'c11_com', name: 'Class 11 Commerce', slug: 'class-11-commerce', priority: 7 },
  { id: 'c11_art', name: 'Class 11 Arts', slug: 'class-11-arts', priority: 8 },
  { id: 'c12_sci', name: 'Class 12 Science', slug: 'class-12-science', priority: 9 },
  { id: 'c12_com', name: 'Class 12 Commerce', slug: 'class-12-commerce', priority: 10 },
  { id: 'c12_art', name: 'Class 12 Arts', slug: 'class-12-arts', priority: 11 },
  { id: 'neet', name: 'NEET Exam Prep', slug: 'neet', priority: 12 }
];

export const mockSubjects: AcademicSubject[] = [
  // Class 6
  { id: 's_math_c6', classId: 'c6', name: 'Mathematics', icon: 'Calculator', description: 'Fractions, Decimals, Algebra, and Ratio & Proportion.' },
  { id: 's_sci_c6', classId: 'c6', name: 'Science', icon: 'Beaker', description: 'Food sources, Fiber to Fabric, Light, Shadows, and Electricity.' },
  
  // Class 7
  { id: 's_math_c7', classId: 'c7', name: 'Mathematics', icon: 'Calculator', description: 'Integers, Rational Numbers, Simple Equations, and Triangles.' },
  { id: 's_sci_c7', classId: 'c7', name: 'Science', icon: 'Beaker', description: 'Nutrition in Plants & Animals, Heat, Acids, and physical changes.' },

  // Class 8
  { id: 's_math_c8', classId: 'c8', name: 'Mathematics', icon: 'Calculator', description: 'Linear Equations, Quadrilaterals, Square & Cube Roots.' },
  { id: 's_sci_c8', classId: 'c8', name: 'Science', icon: 'Beaker', description: 'Crop Production, Microorganisms, Coal & Petroleum, and Cell structure.' },

  // Class 9
  { id: 's_math_c9', classId: 'c9', name: 'Mathematics', icon: 'Calculator', description: 'Number Systems, Polynomials, Coordinate Geometry, and Triangles.' },
  { id: 's_sci_c9', classId: 'c9', name: 'Science', icon: 'Beaker', description: 'Matter in our Surroundings, Force & Laws of Motion, and Gravitation.' },

  // Class 10
  { id: 's_math_c10', classId: 'c10', name: 'Mathematics', icon: 'Calculator', description: 'Algebra, Trigonometry, Geometry, and Statistics for Board Exams.' },
  { id: 's_sci_c10', classId: 'c10', name: 'Science', icon: 'Beaker', description: 'Chemical Reactions, Carbon Compounds, Life Processes, Light Reflection.' },

  // Class 11 Science
  { id: 's_phys_c11', classId: 'c11_sci', name: 'Physics', icon: 'Atom', description: 'Units & Measurements, Kinematics, Laws of Motion, and Gravitation.' },
  { id: 's_chem_c11', classId: 'c11_sci', name: 'Chemistry', icon: 'FlaskConical', description: 'Structure of Atom, Chemical Bonding, Thermodynamics.' },

  // Class 11 Commerce
  { id: 's_acc_c11', classId: 'c11_com', name: 'Accountancy', icon: 'CreditCard', description: 'Introduction to Accounting, Journal entries, Ledger, and Trial Balance.' },
  { id: 's_bst_c11', classId: 'c11_com', name: 'Business Studies', icon: 'Briefcase', description: 'Evolution and Fundamentals of Business, Forms of Business Organisations.' },

  // Class 11 Arts
  { id: 's_hist_c11', classId: 'c11_art', name: 'History', icon: 'BookOpen', description: 'Writing and City Life, An Empire across Three Continents.' },

  // Class 12 Science
  { id: 's_phys_c12', classId: 'c12_sci', name: 'Physics', icon: 'Atom', description: 'Electrostatics, Current Electricity, Magnetism, Optics.' },
  { id: 's_chem_c12', classId: 'c12_sci', name: 'Chemistry', icon: 'FlaskConical', description: 'Solutions, Electrochemistry, Chemical Kinetics, Coordination Compounds.' },

  // Class 12 Commerce
  { id: 's_acc_c12', classId: 'c12_com', name: 'Accountancy', icon: 'CreditCard', description: 'Partnership Accounts, Share Capital, debentures, Analysis of Financial Statements.' },

  // Class 12 Arts
  { id: 's_hist_c12', classId: 'c12_art', name: 'History', icon: 'BookOpen', description: 'Bricks, Beads and Bones, Kings and Chronicles, Rebels and the Raj.' },

  // NEET
  { id: 's_phys', classId: 'neet', name: 'Physics', icon: 'Atom', description: 'Mechanics, Electrostatics, Optics, and Modern Physics for NEET.' },
  { id: 's_chem', classId: 'neet', name: 'Chemistry', icon: 'FlaskConical', description: 'Organic, Inorganic, and Physical Chemistry fundamentals.' },
  { id: 's_bio', classId: 'neet', name: 'Biology', icon: 'Dna', description: 'Botany & Zoology key concepts, cell cycles, and anatomy.' }
];

export const mockCourses: Course[] = [
  {
    id: 'course_neet_physics',
    classId: 'neet',
    subjectId: 's_phys',
    title: 'NEET Masterclass: Complete Electrostatics',
    subtitle: 'Crack high-weightage Electrostatics concepts with shortcuts & problem sets.',
    description: 'Master electric fields, potentials, Gauss Law, and capacitor circuits. Designed by senior NEET mentors with full video lectures, revision notes, and highly curated mock quizzes.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=500&q=80',
    isPremium: true,
    price: 1499,
    discountPrice: 499
  },
  {
    id: 'course_neet_bio',
    classId: 'neet',
    subjectId: 's_bio',
    title: 'NEET Prep: Human Physiology Masterclass',
    subtitle: 'Cover highly scoring human anatomical processes with comprehensive diagrams.',
    description: 'An immersive module tracking digestion, breathing, blood circulation, and nervous coordination. Includes real PDF diagrams, video animations, and previous years (PYQ) quiz attempts.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=500&q=80',
    isPremium: false,
    price: 0
  },
  {
    id: 'course_c10_math',
    classId: 'c10',
    subjectId: 's_math_c10',
    title: 'Class 10 CBSE Math Boards Preparation',
    subtitle: 'Secure a perfect 100/100 score in your mathematics board exam.',
    description: 'Comprehensive video chapters covering Quadratic Equations, Trigonometry identities, Arithmetic Progressions, and coordinate geometry theorems.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&w=500&q=80',
    isPremium: true,
    price: 999,
    discountPrice: 299
  },
  {
    id: 'course_c12_phys_electro',
    classId: 'c12_sci',
    subjectId: 's_phys_c12',
    title: 'Class 12 Boards Electrostatics Foundation',
    subtitle: 'Understand electric charges, Coulomb\'s Law and Gauss Theorem for board exams.',
    description: 'Complete syllabus guide for Class 12 Boards. Clear your concepts with high quality notes and exam questions.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
    isPremium: false,
    price: 0
  }
];

export const mockChapters: AcademicChapter[] = [
  {
    id: 'chap_electrostatics',
    subjectId: 's_phys',
    name: 'Chapter 1: Electric Charges and Fields',
    description: 'Study of stationary electric charges, Coulomb\'s law, Electric forces, and electric flux theorems.',
    orderIndex: 1
  },
  {
    id: 'chap_electro_potential',
    subjectId: 's_phys',
    name: 'Chapter 2: Electrostatic Potential and Capacitance',
    description: 'Electric potential, potential energy, capacitors, dielectric materials, and capacitance combinations.',
    orderIndex: 2
  },
  {
    id: 'chap_physiology_intro',
    subjectId: 's_bio',
    name: 'Chapter 1: Digestion and Absorption',
    description: 'Understanding the human digestive tract, enzyme functions, and key macro-nutritional conversions.',
    orderIndex: 1
  },
  {
    id: 'chap_c10_trig',
    subjectId: 's_math_c10',
    name: 'Chapter 1: Introduction to Trigonometry',
    description: 'Trigonometric ratios, identities, and heights & distances calculations.',
    orderIndex: 1
  }
];

export const mockLessons: Lesson[] = [
  // NEET Physics: Electrostatics Chap 1
  {
    id: 'less_coulombs_law',
    chapterId: 'chap_electrostatics',
    courseId: 'course_neet_physics',
    title: 'Lesson 1.1: Coulomb\'s Law and Superposition Principle',
    description: 'Detailed lecture explaining the electrostatic force between charges and applying vector laws of superposition to find net forces.',
    orderIndex: 1,
    isPremium: false
  },
  {
    id: 'less_electric_field_lines',
    chapterId: 'chap_electrostatics',
    courseId: 'course_neet_physics',
    title: 'Lesson 1.2: Electric Field Lines and Field Strength',
    description: 'Visualization of electric fields. Calculating field strength due to point charges, ring charges, and infinite wires.',
    orderIndex: 2,
    isPremium: false
  },
  {
    id: 'less_gauss_law',
    chapterId: 'chap_electrostatics',
    courseId: 'course_neet_physics',
    title: 'Lesson 1.3: Gauss Law and Core Applications',
    description: 'Applying Gauss Theorem to symmetric charge distributions including spherical shells and planes.',
    orderIndex: 3,
    isPremium: true
  },

  // NEET Physics: Chap 2
  {
    id: 'less_electric_potential',
    chapterId: 'chap_electro_potential',
    courseId: 'course_neet_physics',
    title: 'Lesson 2.1: Concept of Electrostatic Potential',
    description: 'Work done by field, conservative nature of electrostatic force, and potential due to single and dipole configurations.',
    orderIndex: 1,
    isPremium: true
  },

  // NEET Bio: Physiology Chap 1
  {
    id: 'less_digestive_system',
    chapterId: 'chap_physiology_intro',
    courseId: 'course_neet_bio',
    title: 'Lesson 1.1: Human Digestive Alimentary Canal',
    description: 'Comprehensive anatomy tracking teeth, stomach, small intestine, and digestive accessory glands.',
    orderIndex: 1,
    isPremium: false
  },
  {
    id: 'less_digestive_enzymes',
    chapterId: 'chap_physiology_intro',
    courseId: 'course_neet_bio',
    title: 'Lesson 1.2: Enzymes and Absorption Mechanics',
    description: 'Absorption processes, pancreatic enzymes, stomach pepsin, and nutrient assimilation.',
    orderIndex: 2,
    isPremium: false
  }
];

export const mockVideos: Video[] = [
  {
    id: 'vid_coulomb',
    lessonId: 'less_coulombs_law',
    title: 'Introduction to Coulomb\'s Law',
    provider: 'youtube',
    videoIdOrUrl: 'h7gh96X69Gs', // Khan Academy / YouTube example
    durationSeconds: 940
  },
  {
    id: 'vid_field',
    lessonId: 'less_electric_field_lines',
    title: 'Electric Field Lines Visualization',
    provider: 'youtube',
    videoIdOrUrl: 'sfSId8A98y8',
    durationSeconds: 1120
  },
  {
    id: 'vid_gauss',
    lessonId: 'less_gauss_law',
    title: 'Gauss Law Simplified Explanation',
    provider: 'vimeo',
    videoIdOrUrl: '763294323', // Vimeo example ID
    durationSeconds: 1540
  },
  {
    id: 'vid_potential',
    lessonId: 'less_electric_potential',
    title: 'Understanding Electric Potential',
    provider: 'gdrive',
    videoIdOrUrl: 'https://drive.google.com/file/d/1B0q8_v61y9903U0K_XoW2b29o9Cg8_S1/view',
    durationSeconds: 1800
  },
  {
    id: 'vid_digestive',
    lessonId: 'less_digestive_system',
    title: 'Alimentary Canal Walkthrough Animation',
    provider: 'youtube',
    videoIdOrUrl: 'VwrsL-lCZYo',
    durationSeconds: 850
  }
];

export const mockNotes: Note[] = [
  {
    id: 'note_coulomb_pdf',
    lessonId: 'less_coulombs_law',
    title: 'Coulomb\'s Law Hand-Written Revision CheatSheet.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 154000,
    isPremium: false
  },
  {
    id: 'note_field_pdf',
    lessonId: 'less_electric_field_lines',
    title: 'Electric Field & Lines High-Yield Diagrams.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 242000,
    isPremium: false
  },
  {
    id: 'note_gauss_pdf',
    lessonId: 'less_gauss_law',
    title: 'Gauss Law Proofs & CBSE Questions Pack.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 310000,
    isPremium: true
  },
  {
    id: 'note_digest_pdf',
    lessonId: 'less_digestive_system',
    title: 'Anatomy of Alimentary Canal Coloring Sheets.pdf',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeBytes: 480000,
    isPremium: false
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: '⚡ Offline Test Schedule & Doubt Clearing Camps',
    content: 'Dear Scholars, we are launching weekly offline doubt-clearing camp at RK Coaching Center starting this Friday. Live coaching sessions for NEET 2026 physics shortcuts will be shared. Make sure to download the formulas sheet.',
    targetRoles: ['student'],
    isPinned: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ann_2',
    title: '🎯 Class 10 Board Test-Series Launch',
    content: 'Full length mock board tests for Maths & Science are now live! Go to Class 10 subjects directory to practice. Dynamic leaderboards are updated hourly.',
    targetRoles: ['student'],
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];
