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
  { id: 'neet-biology', name: 'NEET Biology', slug: 'neet-biology', priority: 8 },
  { id: 'neet-chemistry', name: 'NEET Chemistry', slug: 'neet-chemistry', priority: 9 },
  { id: 'neet', name: 'NEET (Biology & Chemistry)', slug: 'neet', priority: 10 }
];

const subjectsData: AcademicSubject[] = [];
const coursesData: Course[] = [];
const chaptersData: AcademicChapter[] = [];
const lessonsData: Lesson[] = [];
const videosData: Video[] = [];
const notesData: Note[] = [];

const class6to10Subjects = [
  { name: 'Hindi', icon: 'BookOpen', desc: 'Foundational grammar, literature, and composition exercises.' },
  { name: 'English', icon: 'BookOpen', desc: 'English grammar, reading comprehension, and prose.' },
  { name: 'Assamese', icon: 'BookOpen', desc: 'Regional language reading, vocabulary, and basic poems.' },
  { name: 'General Science', icon: 'Beaker', desc: 'Basic science, experiments, and natural phenomena.' },
  { name: 'General Mathematics', icon: 'Calculator', desc: 'Mathematics foundations, numbers, geometry, and equations.' },
  { name: 'Social Science', icon: 'Briefcase', desc: 'History, geography, and social & political life.' }
];

const scienceSubjects = [
  { name: 'Physics', icon: 'Atom', desc: 'Advanced physical mechanics, laws, thermodynamics and optics.' },
  { name: 'Chemistry', icon: 'FlaskConical', desc: 'Physical, organic, and inorganic chemistry principles.' },
  { name: 'Biology', icon: 'Dna', desc: 'Detailed botany, zoology, human physiology and genetics.' }
];

const neetSubjects = [
  { name: 'Biology', icon: 'Dna', desc: 'High-yield Zoology and Botany concepts, cell cycles, and anatomy.' },
  { name: 'Chemistry', icon: 'FlaskConical', desc: 'Inorganic, Organic, and Physical Chemistry modules optimized for NEET (Biology & Chemistry).' }
];

mockClasses.forEach((cls) => {
  let subjs: { name: string; icon: string; desc: string }[] = [];
  if (['class-6', 'class-7', 'class-8', 'class-9'].includes(cls.slug)) {
    subjs = class6to10Subjects;
  } else if (cls.slug === 'class-10') {
    subjs = class6to10Subjects;
  } else if (['class-11-science', 'class-12-science'].includes(cls.slug)) {
    subjs = scienceSubjects;
  } else if (cls.slug === 'neet-biology') {
    subjs = [neetSubjects[0]];
  } else if (cls.slug === 'neet-chemistry') {
    subjs = [neetSubjects[1]];
  } else if (cls.slug === 'neet') {
    subjs = neetSubjects;
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
      isPremium: idx % 2 === 1,
      price: idx % 2 === 1 ? 499 : 0,
      discountPrice: idx % 2 === 1 ? 199 : undefined
    });

    // 3. Add Chapters based on NCERT Chapters sequence
    const subjectKey = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const ncertChapters: Record<string, string[]> = {
      'english': [
        'Ch 1: Who Did Patrick\'s Homework?',
        'Ch 2: How the Dog Found Himself a New Master!',
        'Ch 3: Taro\'s Reward',
        'Ch 4: An Indian-American Woman in Space',
        'Ch 5: A Different Kind of School'
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
        'Ch 1: Chemical Reactions and Equations',
        'Ch 2: Acids, Bases and Salts',
        'Ch 3: Metals and Non-metals',
        'Ch 4: Carbon and its Compounds',
        'Ch 5: Life Processes',
        'Ch 6: Control and Coordination',
        'Ch 7: How do Organisms Reproduce?',
        'Ch 8: Heredity and Evolution',
        'Ch 9: Light - Reflection and Refraction',
        'Ch 10: Human Eye and Colorful World',
        'Ch 11: Electricity',
        'Ch 12: Magnetic Effects of Electric Current',
        'Ch 13: Our Environment'
      ],
      'generalmathematics': [
        'Ch 1: Real Numbers',
        'Ch 2: Polynomials',
        'Ch 3: Pair of Linear Equations in Two Variables',
        'Ch 4: Quadratic Equations',
        'Ch 5: Arithmetic Progressions',
        'Ch 6: Triangles',
        'Ch 7: Coordinate Geometry',
        'Ch 8: Introduction to Trigonometry',
        'Ch 9: Some Applications of Trigonometry',
        'Ch 10: Circles',
        'Ch 11: Areas Related to Circles',
        'Ch 12: Surface Areas and Volumes',
        'Ch 13: Statistics',
        'Ch 14: Probability'
      ],
      'socialscience': [
        'Ch 1: Resources and Development',
        'Ch 2: Land, Soil, Water, Natural Vegetation and Wildlife Resources',
        'Ch 3: Mineral and Power Resources',
        'Ch 4: Agriculture',
        'Ch 5: Industries',
        'Ch 6: Human Resources'
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
