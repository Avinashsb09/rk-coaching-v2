import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePayments } from '../../context/PaymentContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { mockChapters, mockLessons } from '../../lib/mockData';
import { AcademicChapter, Lesson, Course, Note, Video } from '../../types';
import { 
  ArrowLeft, 
  Layers, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Lock, 
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { RazorpayGatewayModal } from '../../components/commerce/RazorpayGatewayModal';
import { PremiumComingSoonModal } from '../../components/shared/PremiumComingSoonModal';
import { isPremiumEnabled, isPaymentEnabled, PremiumConfig } from '../../lib/systemConfig';

export default function SubjectView() {
  const { 
    subjects, 
    courses, 
    selectedSubjectId, 
    setCurrentView, 
    setSelectedCourseId, 
    setSelectedLessonId,
    setBreadcrumbs,
    addToast,
    chapters,
    lessons,
    notes,
    videos,
    user
  } = useApp();

  const { hasSubjectAccess, grantSubjectAccess, getSubjectPricing } = usePayments();

  const [checkoutNotesOpen, setCheckoutNotesOpen] = useState(false);
  const [premiumComingSoonOpen, setPremiumComingSoonOpen] = useState(false);
  const [pendingResource, setPendingResource] = useState<any>(null);
  const [subjectPrice, setSubjectPrice] = useState<number>(99);

  const handleResourceClick = async (resource: any) => {
    if (!user) {
      addToast('Please log in to view content.', 'warning');
      setCurrentView('auth');
      return;
    }

    if (materialCategory === 'premium' || resource.isPremium) {
      if (hasSubjectAccess(subjectObj!.id) || user.role === 'super_admin' || user.role === 'admin' || user.role === 'teacher') {
        openResource(resource);
      } else {
        // Feature flag: show coming soon modal instead of payment checkout
        if (!isPremiumEnabled()) {
          setPremiumComingSoonOpen(true);
          return;
        }
        
        const pricing = await getSubjectPricing(subjectObj!.id);
        setSubjectPrice(pricing?.price || 99);
        setPendingResource(resource);
        setCheckoutNotesOpen(true);
      }
    } else {
      openResource(resource);
    }
  };

  const openResource = (resource: any) => {
    const associatedLesson = lessonsList.find(l => l.id === resource.lessonId);
    if (associatedLesson) {
      setSelectedLessonId(associatedLesson.id);
    }
    setCurrentView('lesson-view');
  };

  const handleBuyNotes = () => {
    if (!user) {
      addToast('Please log in to purchase premium content.', 'warning');
      setCurrentView('auth');
      return;
    }
    if (!isPremiumEnabled()) {
      setPremiumComingSoonOpen(true);
      return;
    }
    setCheckoutNotesOpen(true);
  };

  // Content selection wizard states
  const [materialCategory, setMaterialCategory] = useState<'free' | 'premium' | null>(null);
  const [contentType, setContentType] = useState<'notes' | 'video' | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Sync / load dynamic database entities
  const [chaptersList, setChaptersList] = useState<AcademicChapter[]>(chapters);
  const [lessonsList, setLessonsList] = useState<Lesson[]>(lessons);
  const [notesList, setNotesList] = useState<Note[]>(notes);
  const [videosList, setVideosList] = useState<Video[]>(videos);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setChaptersList(chapters);
  }, [chapters]);

  useEffect(() => {
    setLessonsList(lessons);
  }, [lessons]);

  useEffect(() => {
    setNotesList(notes);
  }, [notes]);

  useEffect(() => {
    setVideosList(videos);
  }, [videos]);

  const subjectObj = subjects.find(s => s.id === selectedSubjectId);

  // Reset category/contentType/chapter when subject changes
  useEffect(() => {
    setMaterialCategory(null);
    setContentType(null);
    setSelectedChapterId(null);
  }, [selectedSubjectId]);



  // Sync breadcrumbs
  useEffect(() => {
    if (subjectObj) {
      setBreadcrumbs([
        { label: 'All Courses', view: 'catalog' },
        { label: subjectObj.name }
      ]);
    }
  }, [subjectObj, setBreadcrumbs]);

  if (!subjectObj) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Subject structure not selected.</p>
        <Button variant="primary" className="mt-4" onClick={() => setCurrentView('home')}>
          Go to Home
        </Button>
      </div>
    );
  }

  // Filter content
  const filteredChapters = chaptersList.filter(c => c.subjectId === subjectObj.id);
  const subjectCourses = courses.filter(c => c.subjectId === subjectObj.id);

  // Simulated professional subject teacher
  const teacher = {
    name: 'Dr. Anand Ramanujan, PhD',
    role: 'Senior Academic Expert & NEET (Biology & Chemistry) Author',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
    experience: '18+ Years coaching boards & competitive streams.'
  };

  const getChapterResources = (chapterId: string) => {
    const isPremiumMatch = materialCategory === 'premium';
    const chapterLessons = lessonsList.filter(
      l => l.chapterId === chapterId && l.isPremium === isPremiumMatch
    );
    const lessonIds = chapterLessons.map(l => l.id);

    if (contentType === 'notes') {
      return notesList.filter(n => n.lessonId && lessonIds.includes(n.lessonId));
    } else if (contentType === 'video') {
      return videosList.filter(v => v.lessonId && lessonIds.includes(v.lessonId));
    }
    return [];
  };

  const handleSelectCategory = (cat: 'free' | 'premium') => {
    setMaterialCategory(cat);
    setContentType(null);
    setSelectedChapterId(null);
  };

  const handleSelectContentType = (type: 'notes' | 'video') => {
    setContentType(type);
    setSelectedChapterId(null);
  };

  return (
    <div className="space-y-8 py-4 text-left">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setCurrentView('class-view')} 
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
      >
        Back to Class Dashboard
      </Button>

      {/* Header Info */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-500/10 shadow-xl max-w-4xl mx-auto">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <Badge variant="primary" className="bg-blue-600/20 text-blue-200 border-blue-500/30">
              Subject Syllabus Directory
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {subjectObj.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {subjectObj.description}
            </p>
          </div>
        </div>
      </section>

      {/* Centered chapters wizard */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Chapters Section (centered column, wizard) */}
        <div className="space-y-6">
          

          {/* STEP 1: Choose Material Category */}
          {!materialCategory && (
            <section className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Choose Material Category</h2>
                <p className="text-xs text-slate-500 mt-1">Select the grade of study resources you would like to explore.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Free materials */}
                <Card 
                  hoverEffect 
                  className="cursor-pointer border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-48 hover:border-emerald-500/40"
                  onClick={() => handleSelectCategory('free')}
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Free Study Materials</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Access board-aligned revision notes, solved keys, and starter video lectures.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Explore Free Revisions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Card>

                {/* Premium materials */}
                <Card 
                  hoverEffect 
                  className="cursor-pointer border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-48 hover:border-amber-500/40"
                  onClick={() => handleSelectCategory('premium')}
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      {hasSubjectAccess(subjectObj.id) ? <UserCheck className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Premium Study Materials</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unlock high-yield handwritten cheat sheets, formula lists, and exam papers.</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/30">
                      {hasSubjectAccess(subjectObj.id) ? 'UNLOCKED' : PremiumConfig.ui.notesUnlockLabel}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span>Explore Premium Pack</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* STEP 2: Choose Content Type */}
          {materialCategory && !contentType && (
            <section className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Choose Content Type</h2>
                  <p className="text-xs text-slate-500 mt-1">Select the format of resources you want to load.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => { setMaterialCategory(null); }}
                >
                  ← Back to Categories
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Notes */}
                <Card 
                  hoverEffect 
                  className="cursor-pointer border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-48 hover:border-blue-500/40"
                  onClick={() => handleSelectContentType('notes')}
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Handwritten Notes & PDFs</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Read comprehensive chapter revisions, worksheets, and pdf sheets.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>View Chapter Notes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Card>

                {/* Videos */}
                <Card 
                  hoverEffect 
                  className="cursor-pointer border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between h-48 hover:border-indigo-500/40"
                  onClick={() => handleSelectContentType('video')}
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Video Lectures</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Watch topic walkthroughs, boards preparation guides, and classes.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Watch Video Lectures</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* STEP 3 & 4: Chapters Syllabus & Selected Chapter Resources */}
          {materialCategory && contentType && (
            <section className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Official Chapter Syllabus ({filteredChapters.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Currently displaying: <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{materialCategory} Materials</span> ➔ <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{contentType === 'notes' ? 'Notes' : 'Videos'}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => { setContentType(null); setSelectedChapterId(null); }}
                  >
                    ← Change Content Type
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => { setMaterialCategory(null); setContentType(null); setSelectedChapterId(null); }}
                  >
                    Category Selection
                  </Button>
                </div>
              </div>

              {filteredChapters.length === 0 ? (
                <Card className="p-6 text-center border-dashed border-2 bg-slate-50/10 dark:bg-slate-900/10">
                  <p className="text-slate-500 text-sm">No chapters registered for this subject yet. Dynamic chapters sync automatically.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredChapters.map((chapter) => {
                    const resources = getChapterResources(chapter.id);
                    const isExpanded = selectedChapterId === chapter.id;

                    return (
                      <Card key={chapter.id} className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
                        {/* Chapter Accordion Bar */}
                        <div 
                          onClick={() => setSelectedChapterId(isExpanded ? null : chapter.id)}
                          className="bg-slate-50/50 dark:bg-slate-900/40 p-5 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/60 flex items-center justify-between gap-4 select-none"
                        >
                          <div className="space-y-1 text-left">
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                              {chapter.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {chapter.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant={resources.length > 0 ? 'success' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wide">
                              {resources.length} {contentType === 'notes' ? 'Note' : 'Video'}{resources.length !== 1 && 's'}
                            </Badge>
                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                          </div>
                        </div>
                        {/* Chapter Expanded Resources Panel */}
                        {isExpanded && (
                          <CardContent className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-white/30 dark:bg-slate-950/20 text-left animate-fade-in">
                            {resources.length === 0 ? (
                              <div className="text-slate-500 text-xs italic py-2">
                                No study materials published under this chapter yet.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {resources.map((resource: any) => {
                                  const isNotes = contentType === 'notes';
                                  return (
                                    <div 
                                      key={resource.id} 
                                      className="p-4 bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-all"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isNotes ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'}`}>
                                          {isNotes ? <FileText className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">
                                            {resource.title}
                                          </h4>
                                          <p className="text-[10px] text-slate-450 dark:text-slate-450">
                                            {isNotes ? 'Handwritten PDF revision notes' : 'Video class lecture tutorial'}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className={`text-[10px] font-black h-7 px-4 shrink-0 border-none ${isNotes ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-emerald-550 hover:bg-emerald-600 text-slate-950'}`}
                                        onClick={() => handleResourceClick(resource)}
                                      >
                                        {isNotes ? 'Open Notes' : 'Watch Lecture'}
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Premium Coming Soon Modal — shown when Premium System is disabled */}
      <PremiumComingSoonModal
        isOpen={premiumComingSoonOpen}
        onClose={() => setPremiumComingSoonOpen(false)}
      />

      {/* Razorpay Checkout Modal — dynamically loads pricing */}
      {isPaymentEnabled() && (
        <RazorpayGatewayModal
          isOpen={checkoutNotesOpen}
          onClose={() => { setCheckoutNotesOpen(false); setPendingResource(null); }}
          courseTitle={`${subjectObj.name} Subject Premium Access`}
          courseId={subjectObj.id}
          amount={subjectPrice}
          onSuccess={async (paymentId, orderId) => {
            try {
              await grantSubjectAccess(subjectObj.id, paymentId, 'Lifetime', 'Razorpay');
              setCheckoutNotesOpen(false);
              addToast('Subject Premium Access unlocked successfully!', 'success');
              if (pendingResource) {
                openResource(pendingResource);
                setPendingResource(null);
              }
            } catch (err: any) {
              addToast(err.message || 'Payment unlock failed', 'error');
            }
          }}
          onFailure={(reason) => {
            addToast(`Payment failed: ${reason}`, 'error');
          }}
          onCancel={() => {
            setCheckoutNotesOpen(false);
            setPendingResource(null);
            addToast('Payment cancelled by user', 'info');
          }}
          userEmail={user?.email || undefined}
          userFullName={user?.fullName || undefined}
        />
      )}
    </div>
  );
}
