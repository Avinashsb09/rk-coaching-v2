import { Quiz, QuizQuestion, QuizOption, QuizAttempt, LeaderboardEntry } from '../types';

export const initialQuizzes: Quiz[] = [
  {
    id: 'quiz_neet_bio_cell',
    lessonId: 'less_neet_biology_free',
    title: 'Cell Structure & Organelles',
    passingScorePct: 60,
    timerSeconds: 180
  },
  {
    id: 'quiz_c12_physics_electro',
    lessonId: 'less_c12_sci_physics_free',
    title: 'Electrostatics & Electric Fields',
    passingScorePct: 50,
    timerSeconds: 300
  },
  {
    id: 'quiz_c10_math_quad',
    lessonId: 'less_c10_generalmathematics_free',
    title: 'Quadratic Equations Basics',
    passingScorePct: 60,
    timerSeconds: 240
  }
];

export const initialQuestions: QuizQuestion[] = [
  // NEET Bio Cell Questions
  {
    id: 'q_neet_1',
    quizId: 'quiz_neet_bio_cell',
    questionText: 'Which cell organelle is known as the powerhouse of the cell?',
    orderIndex: 1
  },
  {
    id: 'q_neet_2',
    quizId: 'quiz_neet_bio_cell',
    questionText: 'What is the main function of the rough endoplasmic reticulum?',
    orderIndex: 2
  },
  {
    id: 'q_neet_3',
    quizId: 'quiz_neet_bio_cell',
    questionText: 'Which organelle is responsible for packaging proteins in vesicles?',
    orderIndex: 3
  },
  {
    id: 'q_neet_4',
    quizId: 'quiz_neet_bio_cell',
    questionText: 'Which of the following contains its own extrachromosomal DNA?',
    orderIndex: 4
  },
  {
    id: 'q_neet_5',
    quizId: 'quiz_neet_bio_cell',
    questionText: 'Identify the organelle that plays a key role in cellular respiration.',
    orderIndex: 5
  },

  // Class 12 Physics Electrostatics Questions
  {
    id: 'q_phys_1',
    quizId: 'quiz_c12_physics_electro',
    questionText: 'What is the unit of electric permittivity of free space (epsilon_0)?',
    orderIndex: 1
  },
  {
    id: 'q_phys_2',
    quizId: 'quiz_c12_physics_electro',
    questionText: 'If the distance between two charges is doubled, the electrostatic force becomes:',
    orderIndex: 2
  },
  {
    id: 'q_phys_3',
    quizId: 'quiz_c12_physics_electro',
    questionText: 'The electric field inside a perfectly hollow spherical conductor is:',
    orderIndex: 3
  },
  {
    id: 'q_phys_4',
    quizId: 'quiz_c12_physics_electro',
    questionText: 'What is the electric potential at a point on the equatorial line of a dipole?',
    orderIndex: 4
  },
  {
    id: 'q_phys_5',
    quizId: 'quiz_c12_physics_electro',
    questionText: 'Which device is used to store electric charge and electrostatic energy?',
    orderIndex: 5
  },

  // Class 10 Math Quadratic Equations
  {
    id: 'q_math_1',
    quizId: 'quiz_c10_math_quad',
    questionText: 'What is the general form of a quadratic equation?',
    orderIndex: 1
  },
  {
    id: 'q_math_2',
    quizId: 'quiz_c10_math_quad',
    questionText: 'If the discriminant (b^2 - 4ac) is positive and a perfect square, the roots are:',
    orderIndex: 2
  },
  {
    id: 'q_math_3',
    quizId: 'quiz_c10_math_quad',
    questionText: 'Find the roots of the quadratic equation x^2 - 5x + 6 = 0.',
    orderIndex: 3
  },
  {
    id: 'q_math_4',
    quizId: 'quiz_c10_math_quad',
    questionText: 'What is the sum of the roots of the equation 2x^2 - 8x + 6 = 0?',
    orderIndex: 4
  },
  {
    id: 'q_math_5',
    quizId: 'quiz_c10_math_quad',
    questionText: 'What is the value of the discriminant for the equation x^2 - 4x + 4 = 0?',
    orderIndex: 5
  }
];

export const initialOptions: QuizOption[] = [
  // NEET Bio Cell Options
  { id: 'opt_n1_a', questionId: 'q_neet_1', optionText: 'Ribosome', isCorrect: false },
  { id: 'opt_n1_b', questionId: 'q_neet_1', optionText: 'Mitochondrion', isCorrect: true },
  { id: 'opt_n1_c', questionId: 'q_neet_1', optionText: 'Lysosome', isCorrect: false },
  { id: 'opt_n1_d', questionId: 'q_neet_1', optionText: 'Golgi Apparatus', isCorrect: false },

  { id: 'opt_n2_a', questionId: 'q_neet_2', optionText: 'Lipid synthesis', isCorrect: false },
  { id: 'opt_n2_b', questionId: 'q_neet_2', optionText: 'Protein synthesis and folding', isCorrect: true },
  { id: 'opt_n2_c', questionId: 'q_neet_2', optionText: 'Photosynthesis', isCorrect: false },
  { id: 'opt_n2_d', questionId: 'q_neet_2', optionText: 'Detoxification of drugs', isCorrect: false },

  { id: 'opt_n3_a', questionId: 'q_neet_3', optionText: 'Peroxisome', isCorrect: false },
  { id: 'opt_n3_b', questionId: 'q_neet_3', optionText: 'Golgi Apparatus', isCorrect: true },
  { id: 'opt_n3_c', questionId: 'q_neet_3', optionText: 'Centriole', isCorrect: false },
  { id: 'opt_n3_d', questionId: 'q_neet_3', optionText: 'Nucleolus', isCorrect: false },

  { id: 'opt_n4_a', questionId: 'q_neet_4', optionText: 'Chloroplast', isCorrect: true },
  { id: 'opt_n4_b', questionId: 'q_neet_4', optionText: 'Ribosome', isCorrect: false },
  { id: 'opt_n4_c', questionId: 'q_neet_4', optionText: 'Lysosome', isCorrect: false },
  { id: 'opt_n4_d', questionId: 'q_neet_4', optionText: 'Endoplasmic reticulum', isCorrect: false },

  { id: 'opt_n5_a', questionId: 'q_neet_5', optionText: 'Nucleus', isCorrect: false },
  { id: 'opt_n5_b', questionId: 'q_neet_5', optionText: 'Mitochondria', isCorrect: true },
  { id: 'opt_n5_c', questionId: 'q_neet_5', optionText: 'Vacuole', isCorrect: false },
  { id: 'opt_n5_d', questionId: 'q_neet_5', optionText: 'Cytoskeleton', isCorrect: false },

  // Class 12 Physics Electrostatics Options
  { id: 'opt_p1_a', questionId: 'q_phys_1', optionText: 'C^2 N^-1 m^-2', isCorrect: true },
  { id: 'opt_p1_b', questionId: 'q_phys_1', optionText: 'N m^2 C^-2', isCorrect: false },
  { id: 'opt_p1_c', questionId: 'q_phys_1', optionText: 'C N m', isCorrect: false },
  { id: 'opt_p1_d', questionId: 'q_phys_1', optionText: 'F m', isCorrect: false },

  { id: 'opt_p2_a', questionId: 'q_phys_2', optionText: 'Halved', isCorrect: false },
  { id: 'opt_p2_b', questionId: 'q_phys_2', optionText: 'One-fourth', isCorrect: true },
  { id: 'opt_p2_c', questionId: 'q_phys_2', optionText: 'Doubled', isCorrect: false },
  { id: 'opt_p2_d', questionId: 'q_phys_2', optionText: 'Four times', isCorrect: false },

  { id: 'opt_p3_a', questionId: 'q_phys_3', optionText: 'Infinite', isCorrect: false },
  { id: 'opt_p3_b', questionId: 'q_phys_3', optionText: 'Zero', isCorrect: true },
  { id: 'opt_p3_c', questionId: 'q_phys_3', optionText: 'Non-zero constant', isCorrect: false },
  { id: 'opt_p3_d', questionId: 'q_phys_3', optionText: 'Varies with radius', isCorrect: false },

  { id: 'opt_p4_a', questionId: 'q_phys_4', optionText: 'Zero', isCorrect: true },
  { id: 'opt_p4_b', questionId: 'q_phys_4', optionText: 'q / (4 * pi * epsilon_0 * r)', isCorrect: false },
  { id: 'opt_p4_c', questionId: 'q_phys_4', optionText: '2q / r', isCorrect: false },
  { id: 'opt_p4_d', questionId: 'q_phys_4', optionText: 'Negative infinite', isCorrect: false },

  { id: 'opt_p5_a', questionId: 'q_phys_5', optionText: 'Resistor', isCorrect: false },
  { id: 'opt_p5_b', questionId: 'q_phys_5', optionText: 'Capacitor', isCorrect: true },
  { id: 'opt_p5_c', questionId: 'q_phys_5', optionText: 'Inductor', isCorrect: false },
  { id: 'opt_p5_d', questionId: 'q_phys_5', optionText: 'Diode', isCorrect: false },

  // Class 10 Math Quadratic Equations Options
  { id: 'opt_m1_a', questionId: 'q_math_1', optionText: 'ax^2 + bx + c = 0 (a != 0)', isCorrect: true },
  { id: 'opt_m1_b', questionId: 'q_math_1', optionText: 'ax + b = 0', isCorrect: false },
  { id: 'opt_m1_c', questionId: 'q_math_1', optionText: 'ax^3 + bx^2 + cx + d = 0', isCorrect: false },
  { id: 'opt_m1_d', questionId: 'q_math_1', optionText: 'y = mx + c', isCorrect: false },

  { id: 'opt_m2_a', questionId: 'q_math_2', optionText: 'Real, rational, and unequal', isCorrect: true },
  { id: 'opt_m2_b', questionId: 'q_math_2', optionText: 'Real and equal', isCorrect: false },
  { id: 'opt_m2_c', questionId: 'q_math_2', optionText: 'Imaginary', isCorrect: false },
  { id: 'opt_m2_d', questionId: 'q_math_2', optionText: 'Irrational and equal', isCorrect: false },

  { id: 'opt_m3_a', questionId: 'q_math_3', optionText: 'x = 2, 3', isCorrect: true },
  { id: 'opt_m3_b', questionId: 'q_math_3', optionText: 'x = 1, 6', isCorrect: false },
  { id: 'opt_m3_c', questionId: 'q_math_3', optionText: 'x = -2, -3', isCorrect: false },
  { id: 'opt_m3_d', questionId: 'q_math_3', optionText: 'x = 0, 5', isCorrect: false },

  { id: 'opt_m4_a', questionId: 'q_math_4', optionText: '4', isCorrect: true },
  { id: 'opt_m4_b', questionId: 'q_math_4', optionText: '8', isCorrect: false },
  { id: 'opt_m4_c', questionId: 'q_math_4', optionText: '3', isCorrect: false },
  { id: 'opt_m4_d', questionId: 'q_math_4', optionText: '-4', isCorrect: false },

  { id: 'opt_m5_a', questionId: 'q_math_5', optionText: '0', isCorrect: true },
  { id: 'opt_m5_b', questionId: 'q_math_5', optionText: '8', isCorrect: false },
  { id: 'opt_m5_c', questionId: 'q_math_5', optionText: '16', isCorrect: false },
  { id: 'opt_m5_d', questionId: 'q_math_5', optionText: '-8', isCorrect: false }
];

export const initialAttempts: QuizAttempt[] = [
  {
    id: 'att_1',
    userId: 'usr_student',
    quizId: 'quiz_neet_bio_cell',
    scoreObtained: 11, // 4 correct (+12), 1 wrong (-1) = 11 marks
    totalQuestions: 5,
    isPassed: true,
    attemptedAt: '2026-06-25T14:32:00.000Z'
  },
  {
    id: 'att_2',
    userId: 'usr_student',
    quizId: 'quiz_c12_physics_electro',
    scoreObtained: 7, // 3 correct (+9), 2 wrong (-2) = 7 marks
    totalQuestions: 5,
    isPassed: false,
    attemptedAt: '2026-06-28T09:15:00.000Z'
  }
];

export const initialLeaderboards: LeaderboardEntry[] = [
  { id: 'lb_1', userId: 'student_1', fullName: 'Amit Verma', role: 'student', pointsXp: 1850, rank: 1 },
  { id: 'lb_2', userId: 'student_2', fullName: 'Ritu Sen', role: 'student', pointsXp: 1620, rank: 2 },
  { id: 'lb_3', userId: 'student_3', fullName: 'Devashish Das', role: 'student', pointsXp: 1440, rank: 3 },
  { id: 'lb_4', userId: 'student_4', fullName: 'Sneha Barua', role: 'student', pointsXp: 1390, rank: 4 }
];
