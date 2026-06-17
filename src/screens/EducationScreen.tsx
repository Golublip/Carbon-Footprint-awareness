import React, { useState } from 'react';
import { ARTICLES, QUIZ_QUESTIONS } from '../constants/educationData';
import { Card, Button } from '../widgets/SharedUI';
import { BookOpen, Award, CheckCircle, XCircle, Search } from 'lucide-react';

export const EducationScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'quizzes'>('articles');
  
  // Quiz states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const filteredArticles = ARTICLES.filter(art =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIdx(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOptionIdx === null || isAnswerSubmitted) return;
    
    const correctIdx = QUIZ_QUESTIONS[currentQuestionIdx].correctIndex;
    if (selectedOptionIdx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    setSelectedOptionIdx(null);
    setIsAnswerSubmitted(false);
    
    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Climate Resource Center
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Explore sustainable guides, learn about climate action, and test your ecological literacy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2" role="tablist" aria-label="Education resources tabs">
        <button
          role="tab"
          aria-selected={activeTab === 'articles'}
          aria-controls="articles-panel"
          id="articles-tab"
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-t-md ${
            activeTab === 'articles'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          Guides & Articles
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'quizzes'}
          aria-controls="quizzes-panel"
          id="quizzes-tab"
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-t-md ${
            activeTab === 'quizzes'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" aria-hidden="true" />
          Sustainability Quizzes
        </button>
      </div>

      {/* Tab Panels */}
      {/* 1. ARTICLES PANEL */}
      <div id="articles-panel" role="tabpanel" aria-labelledby="articles-tab" hidden={activeTab !== 'articles'} className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
          </span>
          <input
            type="text"
            placeholder="Search sustainability topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-950 dark:text-zinc-100 transition-all shadow-sm"
            aria-label="Search articles and guides"
          />
        </div>

        {filteredArticles.length === 0 ? (
          <Card className="text-center py-8 text-zinc-400 text-sm">
            No guides found matching your search.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map(article => (
              <Card key={article.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{article.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 mt-3">{article.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  {/* Article content detail */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-850 space-y-2.5 text-xs text-zinc-650 dark:text-zinc-300">
                    {article.content.map((para, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 2. QUIZ PANEL */}
      <div id="quizzes-panel" role="tabpanel" aria-labelledby="quizzes-tab" hidden={activeTab !== 'quizzes'}>
        <Card className="max-w-xl mx-auto">
          {quizCompleted ? (
            <div className="text-center py-6 space-y-4">
              <TrophyIcon className="w-16 h-16 text-amber-500 mx-auto" />
              <h3 className="text-xl font-black text-zinc-950 dark:text-zinc-50">Quiz Completed!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You scored <span className="font-bold font-mono">{quizScore}</span> out of{' '}
                <span className="font-bold font-mono">{QUIZ_QUESTIONS.length}</span>!
              </p>
              <div className="pt-4">
                <Button onClick={handleRestartQuiz} ariaLabel="Restart quiz">
                  Restart Quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quiz Progress */}
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
                <span>QUESTION {currentQuestionIdx + 1} OF {QUIZ_QUESTIONS.length}</span>
                <span>SCORE: {quizScore}</span>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                {QUIZ_QUESTIONS[currentQuestionIdx].question}
              </h3>

              {/* Option Choices */}
              <div className="space-y-3" role="radiogroup" aria-label="Question choices">
                {QUIZ_QUESTIONS[currentQuestionIdx].options.map((option, idx) => {
                  const isSelected = selectedOptionIdx === idx;
                  const isCorrect = QUIZ_QUESTIONS[currentQuestionIdx].correctIndex === idx;
                  
                  let optionStyles = 'border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700';
                  if (isSelected) optionStyles = 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500';
                  
                  if (isAnswerSubmitted) {
                    if (isCorrect) optionStyles = 'border-emerald-500 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 ring-1 ring-emerald-500';
                    else if (isSelected) optionStyles = 'border-rose-500 bg-rose-500/5 text-rose-800 dark:text-rose-400 ring-1 ring-rose-500';
                    else optionStyles = 'opacity-60 border-zinc-200 dark:border-zinc-850';
                  }

                  return (
                    <button
                      key={idx}
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${optionStyles}`}
                    >
                      <span>{option}</span>
                      {isAnswerSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  selectedOptionIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                    : 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-500/20 text-rose-800 dark:text-rose-400'
                }`}>
                  <h4 className="font-bold mb-1">
                    {selectedOptionIdx === QUIZ_QUESTIONS[currentQuestionIdx].correctIndex ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p>{QUIZ_QUESTIONS[currentQuestionIdx].explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end">
                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={selectedOptionIdx === null}
                    ariaLabel="Submit answer"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} ariaLabel="Proceed to next question">
                    {currentQuestionIdx === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Simple Trophy Icon SVG component
const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
  </svg>
);
