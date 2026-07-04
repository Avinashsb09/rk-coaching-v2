/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AcademicClass, AcademicSubject, Course, AcademicChapter, Lesson, Video, Note, Announcement } from '../types';

export const mockClasses: AcademicClass[] = [
  { id: 'c6', name: 'Class 6', slug: 'class-6', priority: 1 },
  { id: 'c7', name: 'Class 7', slug: 'class-7', priority: 2 },
  { id: 'c8', name: 'Class 8', slug: 'class-8', priority: 3 },
  { id: 'c9', name: 'Class 9', slug: 'class-9', priority: 4 },
  { id: 'c10', name: 'Class 10', slug: 'class-10', priority: 5 },
  { id: 'c11_sci', name: 'Class 11 Science', slug: 'class-11-science', priority: 6 },
  { id: 'c12_sci', name: 'Class 12 Science', slug: 'class-12-science', priority: 7 },
  { id: 'neet', name: 'NEET (Biology & Chemistry)', slug: 'neet', priority: 8 },
  { id: 'bpharm', name: 'B.Pharm Preparation', slug: 'b-pharm-preparation', priority: 9 },
  { id: 'nursing', name: 'Nursing Preparation', slug: 'nursing-preparation', priority: 10 }
];

const subjectsData: AcademicSubject[] = [];
const coursesData: Course[] = [];
const chaptersData: AcademicChapter[] = [];
const lessonsData: Lesson[] = [];
const videosData: Video[] = [];
const notesData: Note[] = [];

const class6to10Subjects = [
  { name: 'English', icon: 'BookOpen', desc: 'English grammar, reading comprehension, and prose.' },
  { name: 'Hindi', icon: 'Book', desc: 'Hindi language, grammar, reading comprehension, and literature.' },
  { name: 'Assamese', icon: 'Book', desc: 'Assamese language, culture, grammar, and literature.' },
  { name: 'General Mathematics', icon: 'Calculator', desc: 'Mathematics foundations, numbers, geometry, and equations.' },
  { name: 'General Science', icon: 'Beaker', desc: 'Basic science, chemical reactions, life processes, and physical phenomena.' },
  { name: 'Social Science', icon: 'Globe', desc: 'Geography, history, civics, and economics.' }
];

const scienceSubjects = [
  { name: 'Physics', icon: 'Atom', desc: 'Advanced physical mechanics, laws, thermodynamics and optics.' },
  { name: 'Chemistry', icon: 'FlaskConical', desc: 'Physical, organic, and inorganic chemistry principles.' },
  { name: 'Biology', icon: 'Dna', desc: 'Detailed botany, zoology, human physiology and genetics.' },
  { name: 'Mathematics', icon: 'Calculator', desc: 'Advanced mathematics, calculus, vectors, algebra.' },
  { name: 'English', icon: 'BookOpen', desc: 'English core curriculum, reading, writing, and literature.' }
];

const neetSubjects = [
  { name: 'Biology', icon: 'Dna', desc: 'High-yield Zoology and Botany concepts, cell cycles, and anatomy.' },
  { name: 'Chemistry', icon: 'FlaskConical', desc: 'Inorganic, Organic, and Physical Chemistry modules optimized for NEET.' }
];

const bpharmSubjects = [
  { name: 'Pharmaceutics', icon: 'FlaskConical', desc: 'Introduction to dosage forms, formulation designs, and pharmacy practice.' },
  { name: 'Pharmaceutical Chemistry', icon: 'Atom', desc: 'Inorganic chemistry, organic synthesis, and biochemistry analysis.' },
  { name: 'Pharmacognosy', icon: 'Leaf', desc: 'Study of medicines derived from natural sources, herbs, and plants.' }
];

const nursingSubjects = [
  { name: 'Anatomy & Physiology', icon: 'Dna', desc: 'Structure and functions of the human body, organ systems, and functions.' },
  { name: 'Nursing Foundations', icon: 'HeartPulse', desc: 'Core principles of nursing care, first-aid, patient health, and hygiene.' },
  { name: 'Microbiology', icon: 'Microscope', desc: 'Study of micro-organisms, infection control, and pathogenic bacteria.' }
];

mockClasses.forEach((cls) => {
  let subjs: { name: string; icon: string; desc: string }[] = [];
  if (['class-6', 'class-7', 'class-8', 'class-9'].includes(cls.slug)) {
    subjs = class6to10Subjects;
  } else if (cls.slug === 'class-10') {
    subjs = class6to10Subjects;
  } else if (['class-11-science', 'class-12-science'].includes(cls.slug)) {
    subjs = scienceSubjects;
  } else if (cls.slug === 'neet') {
    subjs = neetSubjects;
  } else if (cls.slug === 'b-pharm-preparation') {
    subjs = bpharmSubjects;
  } else if (cls.slug === 'nursing-preparation') {
    subjs = nursingSubjects;
  }

  subjs.forEach((sub, idx) => {
    const subjectId = `sub_${cls.id}_${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // 1. Add Subject
    subjectsData.push({
      id: subjectId,
      classId: cls.id,
      name: sub.name,
      icon: sub.icon,
      description: `${cls.name} ${sub.name}: ${sub.desc}`
    });

    // 2. Add Course (Prep Module)
    const courseId = `course_${cls.id}_${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const isPremium = cls.slug.includes('prep') || cls.slug === 'neet' || idx % 2 === 1;
    coursesData.push({
      id: courseId,
      classId: cls.id,
      subjectId: subjectId,
      title: `${cls.name} ${sub.name} Board Masterclass`,
      subtitle: `Unlock high-yield handwritten notes, video lectures, and revision test papers.`,
      description: `Comprehensive prep course covering the full syllabus of ${cls.name} ${sub.name} aligned with target academic years. Built by top subject experts at RK Coaching.`,
      thumbnailUrl: cls.slug === 'neet' 
        ? 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=500&q=80'
        : 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&w=500&q=80',
      isPremium: isPremium,
      price: isPremium ? 499 : 0,
      discountPrice: isPremium ? 199 : undefined
    });

    // 3. Add Chapters based on NCERT Chapters sequence
    const subjectKey = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const ncertChapters: Record<string, string[]> = {
      'english': [
        'Ch 1: Who Did Patrick\'s Homework?',
        'Ch 2: How the Dog Found Himself a New Master!',
        'Ch 3: Taro\'s Reward',
        'Ch 4: An Indian-American Woman in Space',
        'Ch 5: A Different Kind of School',
        'Ch 6: Who I Am',
        'Ch 7: Fair Play',
        'Ch 8: A Game of Chance',
        'Ch 9: Desert Animals',
        'Ch 10: The Banyan Tree'
      ],
      'hindi': [
        'Ch 1: वह चिड़िया जो',
        'Ch 2: बचपन',
        'Ch 3: नादान दोस्त',
        'Ch 4: चाँद से थोड़ी-सी गप्पें',
        'Ch 5: अक्षरों का महत्व'
      ],
      'assamese': [
        'Ch 1: আমাৰ জন্মভূমি',
        'Ch 2: বৰগীত',
        'Ch 3: অসমৰ জাতীয় উৎসৱ',
        'Ch 4: দেশৰ বাবে প্ৰাণ আহুতি',
        'Ch 5: সৎ সংগ'
      ],
      'generalscience': [
        'Ch 1: Crop Production and Management',
        'Ch 2: Microorganisms: Friend and Foe',
        'Ch 3: Coal and Petroleum',
        'Ch 4: Combustion and Flame',
        'Ch 5: Conservation of Plants and Animals',
        'Ch 6: Reproduction in Animals',
        'Ch 7: Reaching the Age of Adolescence',
        'Ch 8: Force and Pressure',
        'Ch 9: Friction',
        'Ch 10: Sound',
        'Ch 11: Chemical Effects of Electric Current',
        'Ch 12: Some Natural Phenomena',
        'Ch 13: Light'
      ],
      'generalmathematics': [
        'Ch 1: Rational Numbers',
        'Ch 2: Linear Equations in One Variable',
        'Ch 3: Understanding Quadrilaterals',
        'Ch 4: Data Handling',
        'Ch 5: Squares and Square Roots',
        'Ch 6: Cubes and Cube Roots',
        'Ch 7: Comparing Quantities',
        'Ch 8: Algebraic Expressions and Identities',
        'Ch 9: Mensuration',
        'Ch 10: Exponents and Powers',
        'Ch 11: Direct and Inverse Proportions',
        'Ch 12: Factorisation',
        'Ch 13: Introduction to Graphs'
      ],
      'mathematics': [
        'Ch 1: Relations and Functions',
        'Ch 2: Inverse Trigonometric Functions',
        'Ch 3: Matrices',
        'Ch 4: Determinants',
        'Ch 5: Continuity and Differentiability',
        'Ch 6: Application of Derivatives',
        'Ch 7: Integrals',
        'Ch 8: Application of Integrals',
        'Ch 9: Differential Equations',
        'Ch 10: Vector Algebra',
        'Ch 11: Three Dimensional Geometry',
        'Ch 12: Linear Programming',
        'Ch 13: Probability'
      ],
      'socialscience': [
        'Ch 1: Resources',
        'Ch 2: Land, Soil, Water, Natural Vegetation and Wildlife Resources',
        'Ch 3: Agriculture',
        'Ch 4: Industries',
        'Ch 5: Human Resources',
        'Ch 6: The Indian Constitution',
        'Ch 7: Understanding Secularism',
        'Ch 8: Ruling the Countryside',
        'Ch 9: Women, Caste and Reform',
        'Ch 10: The Making of the National Movement'
      ],
      'physics': [
        'Ch 1: Electric Charges and Fields',
        'Ch 2: Electrostatic Potential and Capacitance',
        'Ch 3: Current Electricity',
        'Ch 4: Moving Charges and Magnetism',
        'Ch 5: Magnetism and Matter',
        'Ch 6: Electromagnetic Induction',
        'Ch 7: Alternating Current',
        'Ch 8: Electromagnetic Waves',
        'Ch 9: Ray Optics and Optical Instruments',
        'Ch 10: Wave Optics',
        'Ch 11: Dual Nature of Radiation and Matter',
        'Ch 12: Atoms',
        'Ch 13: Nuclei',
        'Ch 14: Semiconductor Electronics'
      ],
      'chemistry': [
        'Ch 1: Solutions',
        'Ch 2: Electrochemistry',
        'Ch 3: Chemical Kinetics',
        'Ch 4: The d-and f-Block Elements',
        'Ch 5: Coordination Compounds',
        'Ch 6: Haloalkanes and Haloarenes',
        'Ch 7: Alcohols, Phenols and Ethers',
        'Ch 8: Aldehydes, Ketones and Carboxylic Acids',
        'Ch 9: Amines',
        'Ch 10: Biomolecules'
      ],
      'biology': [
        'Ch 1: The Living World',
        'Ch 2: Biological Classification',
        'Ch 3: Plant Kingdom',
        'Ch 4: Animal Kingdom',
        'Ch 5: Morphology of Flowering Plants',
        'Ch 6: Anatomy of Flowering Plants',
        'Ch 7: Structural Organisation in Animals',
        'Ch 8: Cell: The Unit of Life',
        'Ch 9: Biomolecules',
        'Ch 10: Cell Cycle and Cell Division',
        'Ch 11: Photosynthesis in Higher Plants',
        'Ch 12: Respiration in Plants',
        'Ch 13: Plant Growth and Development',
        'Ch 14: Breathing and Exchange of Gases',
        'Ch 15: Body Fluids and Circulation',
        'Ch 16: Excretory Products and their Elimination',
        'Ch 17: Locomotion and Movement',
        'Ch 18: Neural Control and Coordination',
        'Ch 19: Chemical Coordination and Integration'
      ],
      'pharmaceutics': [
        'Ch 1: Introduction to Dosage Forms',
        'Ch 2: Metrology and Calculations',
        'Ch 3: Liquid Dosage Forms'
      ],
      'pharmaceuticalchemistry': [
        'Ch 1: Inorganic Pharmaceuticals',
        'Ch 2: Acid-Base Titrations',
        'Ch 3: Impurities in Pharmaceuticals'
      ],
      'pharmacognosy': [
        'Ch 1: Scope of Pharmacognosy',
        'Ch 2: Classification of Crude Drugs',
        'Ch 3: Adulteration and Evaluation'
      ],
      'anatomyphysiology': [
        'Ch 1: Introduction to Human Body',
        'Ch 2: Skeletal and Muscular Systems',
        'Ch 3: Cardiovascular System'
      ],
      'nursingfoundations': [
        'Ch 1: History of Nursing and Ethics',
        'Ch 2: Nursing Process and Care Plans',
        'Ch 3: Vital Signs Assessment'
      ],
      'microbiology': [
        'Ch 1: Introduction to Microorganisms',
        'Ch 2: Bacteria Morphology and Staining',
        'Ch 3: Sterilization and Disinfection'
      ]
    };

    const activeChapters = ncertChapters[subjectKey] || [
      `Chapter 1: Foundations of ${sub.name}`,
      `Chapter 2: Core Theories in ${sub.name}`,
      `Chapter 3: Final Solver revision`
    ];

    activeChapters.forEach((chapName, chapIdx) => {
      const chapterId = `chap_${cls.id}_${subjectKey}_${chapIdx + 1}`;
      chaptersData.push({
        id: chapterId,
        subjectId: subjectId,
        name: chapName,
        description: `NCERT syllabus aligned textbook references and chapter workouts.`,
        orderIndex: chapIdx + 1
      });

      // Add lessons only to the first chapter to avoid bloating mock data, while keeping structural linkage clean
      if (chapIdx === 0) {
        const lessonFreeId = `less_${cls.id}_${subjectKey}_free`;
        const lessonPremiumId = `less_${cls.id}_${subjectKey}_premium`;

        lessonsData.push({
          id: lessonFreeId,
          chapterId: chapterId,
          courseId: courseId,
          title: `Lesson 1.1: Introduction and Core Theories (Free Notes)`,
          description: `Foundational overview video and high-yield notes. Fully accessible.`,
          orderIndex: 1,
          isPremium: false
        });

        lessonsData.push({
          id: lessonPremiumId,
          chapterId: chapterId,
          courseId: courseId,
          title: `Lesson 1.2: Premium Practice Problems & PYQ Sheets`,
          description: `Detailed chapter solving guide, tricky previous years questions, and downloadable notes.`,
          orderIndex: 2,
          isPremium: true
        });

        // 5. Add Video lectures for both lessons
        videosData.push({
          id: `vid_${lessonFreeId}`,
          lessonId: lessonFreeId,
          title: `Core video lecture: ${sub.name} Concepts`,
          provider: 'youtube',
          videoIdOrUrl: 'h7gh96X69Gs',
          durationSeconds: 900
        });

        videosData.push({
          id: `vid_${lessonPremiumId}`,
          lessonId: lessonPremiumId,
          title: `High-Yield Revision Guide for ${sub.name}`,
          provider: 'youtube',
          videoIdOrUrl: 'sfSId8A98y8',
          durationSeconds: 1200
        });

        // 6. Add PDF Notes (Free and Premium)
        notesData.push({
          id: `note_${lessonFreeId}_pdf`,
          lessonId: lessonFreeId,
          classId: cls.id,
          title: `${cls.name} ${sub.name} - Revision Handout (Free).pdf`,
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          sizeBytes: 154000,
          isPremium: false,
          price: 0
        });

        notesData.push({
          id: `note_${lessonPremiumId}_pdf`,
          lessonId: lessonPremiumId,
          classId: cls.id,
          title: `${cls.name} ${sub.name} - Premium Chapter Key (Locked).pdf`,
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          sizeBytes: 280000,
          isPremium: true,
          price: null // Configurable!
        });
      }
    });
  });
});

export const mockSubjects: AcademicSubject[] = subjectsData;
export const mockCourses: Course[] = coursesData;
export const mockChapters: AcademicChapter[] = chaptersData;
export const mockLessons: Lesson[] = lessonsData;
export const mockVideos: Video[] = videosData;
export const mockNotes: Note[] = notesData;

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: '⚡ Offline Test Schedule & Doubt Clearing Camps',
    content: 'Dear Scholars, we are launching weekly offline doubt-clearing camp at RK Coaching Center starting this Friday. Live coaching sessions for NEET (Biology & Chemistry) 2026 physics shortcuts will be shared. Make sure to download the formulas sheet.',
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
