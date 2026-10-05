import React from 'react';
import { User } from '../types';
import {
  Heart,
  Stethoscope,
  ShieldAlert,
  User as UserIcon,
  PlusCircle,
  MessageSquare,
  FileText,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenDataModal: () => void;
  onOpenReportModal: () => void;
  onToggleChat: () => void;
  onOpenCommunication?: () => void;
  onOpenAuthModal: () => void;
  onSwitchDemo: (role: 'patient' | 'doctor' | 'admin', targetId?: string) => void;
  onLogout: () => void;
  activeTab: 'patient' | 'doctor' | 'admin';
  setActiveTab: (tab: 'patient' | 'doctor' | 'admin') => void;
  unreadChatCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenDataModal,
  onOpenReportModal,
  onToggleChat,
  onOpenCommunication,
  onOpenAuthModal,
  onSwitchDemo,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Bar */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px] tracking-wide uppercase border border-rose-500/30">
            Interactive Multi-Role Mode
          </span>
          <span className="text-slate-300 hidden sm:inline">Switch view to test role-specific workflows:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSwitchDemo('patient', 'pat-1')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              currentUser?.role === 'patient' && currentUser.id === 'pat-1'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400" />
            Patient (Priya)
          </button>

          <button
            onClick={() => onSwitchDemo('patient', 'pat-3')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hidden md:flex items-center gap-1.5 ${
              currentUser?.role === 'patient' && currentUser.id === 'pat-3'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Patient (Sunita - Cervical)
          </button>

          <button
            onClick={() => onSwitchDemo('doctor', 'doc-1')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              currentUser?.role === 'doctor' && currentUser.id === 'doc-1'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3 h-3 text-indigo-400" />
            <span>Dr. Ananya (OB/GYN)</span>
          </button>

          <button
            onClick={() => onSwitchDemo('doctor', 'doc-2')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              currentUser?.role === 'doctor' && currentUser.id === 'doc-2'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3 h-3 text-indigo-400" />
            <span>Dr. Rajesh (Onco)</span>
          </button>

          <button
            onClick={() => onSwitchDemo('admin', 'admin-1')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              currentUser?.role === 'admin'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Admin (ML & Registry)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-500/20 text-white">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight font-display">
                MatraCare<span className="text-rose-600">.AI</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                Clinical v1.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Maternal Risk Prediction &amp; Nutritional Guidance
            </p>
          </div>
        </div>

        {/* Center Role Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('patient')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'patient'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Patient Portal
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'doctor'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
            Doctor Dashboard
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Admin &amp; Models
          </button>
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenDataModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>Record Vitals</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Download Clinical Summary (PDF)"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">Download Report</span>
          </button>

          {onOpenCommunication && (
            <button
              onClick={onOpenCommunication}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
              title="Doctor-Patient Direct Clinical Channel"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Doctor Chat</span>
            </button>
          )}

          <button
            onClick={onToggleChat}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Ask AI Guide</span>
          </button>

          {/* User profile dropdown / login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden xl:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] capitalize text-slate-500 font-medium">
                  {currentUser.role}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
