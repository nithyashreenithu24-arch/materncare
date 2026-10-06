import React from 'react';
import { User, HealthRecord, PredictionResult, NutritionPlan, DoctorNote } from '../types';
import { RiskGauge, TrendLineChart, FeatureContributionList } from './Charts';
import {
  Heart,
  Activity,
  Droplets,
  Calendar,
  Utensils,
  MessageSquare,
  FileDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Pill,
  Bell,
  ShieldCheck,
  Shield,
  Circle,
} from 'lucide-react';

interface PatientDashboardProps {
  patient: User;
  records: HealthRecord[];
  predictions?: { gdm: PredictionResult; cervical: PredictionResult };
  nutritionPlan?: NutritionPlan;
  doctorNotes?: DoctorNote[];
  onOpenDataModal: () => void;
  onOpenNutritionModal: () => void;
  onOpenReportModal: () => void;
  onOpenChat: () => void;
  onOpenCommunication?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  records,
  predictions,
  nutritionPlan,
  doctorNotes = [],
  onOpenDataModal,
  onOpenNutritionModal,
  onOpenReportModal,
  onOpenChat,
  onOpenCommunication,
}) => {
  const latestRecord = records[records.length - 1];

  const glucoseChartData = records.map((r, i) => ({
    label: r.gestationalWeeks ? `Wk ${r.gestationalWeeks}` : `T+${i}`,
    value: r.postPrandialBloodSugar,
    secondaryValue: r.fastingBloodSugar,
  }));

  const bpChartData = records.map((r, i) => ({
    label: r.gestationalWeeks ? `Wk ${r.gestationalWeeks}` : `T+${i}`,
    value: r.bloodPressureSys,
    secondaryValue: r.bloodPressureDia,
  }));

  return (
    <div className="space-y-12">
      {/* 1. VIEWPORT HERO & MISSION CONTEXT */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0 opacity-40">
           <img 
            src="/src/assets/images/healthcare_biotech_hero_1791214862368.jpg" 
            className="w-full h-full object-cover" 
            alt="Clinical Laboratory"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.3em] uppercase opacity-70">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Monitoring
            </span>
            <span className="opacity-30">|</span>
            <span>Ref: {patient.id}</span>
            <span className="opacity-30">|</span>
            <span>{latestRecord?.gestationalWeeks ? `Week ${latestRecord.gestationalWeeks}` : 'Baseline'}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl text-wrap-balance">
            Welcome back, {patient.name.split(' ')[0]}.
          </h1>
          
          <p className="text-slate-300 text-sm md:text-lg max-w-xl leading-relaxed opacity-90">
            Continuous clinical telemetry synchronized. Your predictive risk vectors for GDM and Cervical Health are updated to the latest sampling.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={onOpenDataModal} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Capture New Sample
            </button>
            <button onClick={onOpenReportModal} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-700 border border-white/10 transition-all flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export Dossier
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY ANALYTIC STAGE (GDM & CERVICAL) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="panel-precision p-8 rounded-3xl flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">GDM Analytics</h3>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">Gestational Diabetes Mellitus</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Model Version</span>
                <span className="text-xs font-bold text-slate-900">{predictions?.gdm.modelVersion || 'v1.2.4'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <RiskGauge
                score={predictions?.gdm.scorePercentage || 25}
                category={predictions?.gdm.riskCategory || 'Low'}
                title="Gestational Diabetes"
                size={180}
              />
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Directive</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {predictions?.gdm.clinicalAction || 'Routine prenatal surveillance. Target fasting glucose ≤ 95 mg/dL.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Next Review: T+{predictions?.gdm.recommendedFollowUpDays || 28}D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12">
            {predictions?.gdm.topFactors && (
              <FeatureContributionList
                factors={predictions.gdm.topFactors.slice(0, 3)}
                title="Telemetry Vectors"
              />
            )}
          </div>
        </div>

        <div className="panel-precision p-8 rounded-3xl flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Oncology Screening</h3>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">Cervical Cytology Analysis</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Model Version</span>
                <span className="text-xs font-bold text-slate-900">{predictions?.cervical.modelVersion || 'v1.1.8'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <RiskGauge
                score={predictions?.cervical.scorePercentage || 12}
                category={predictions?.cervical.riskCategory || 'Low'}
                title="Cervical Neoplasia"
                size={180}
              />
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Strategy</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {predictions?.cervical.clinicalAction || 'Continue routine 3-year Pap/HPV screening.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>Interval: 12 Months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12">
            {predictions?.cervical.topFactors && (
              <FeatureContributionList
                factors={predictions.cervical.topFactors.slice(0, 3)}
                title="Screening Parameters"
              />
            )}
          </div>
        </div>
      </section>

      {/* 3. PRECISION METRIC STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Blood Pressure', value: `${latestRecord?.bloodPressureSys || 120}/${latestRecord?.bloodPressureDia || 80}`, unit: 'mmHg', status: 'nominal', statusLabel: 'Nominal' },
          { label: 'Post-Meal Sugar', value: latestRecord?.postPrandialBloodSugar || 118, unit: 'mg/dL', status: (latestRecord?.postPrandialBloodSugar || 0) > 140 ? 'critical' : 'nominal', statusLabel: (latestRecord?.postPrandialBloodSugar || 0) > 140 ? 'Elevated' : 'Stable' },
          { label: 'Fasting Sugar', value: latestRecord?.fastingBloodSugar || 90, unit: 'mg/dL', status: 'nominal', statusLabel: 'Verified' },
          { label: 'Hemoglobin', value: latestRecord?.hemoglobin || 11.2, unit: 'g/dL', status: (latestRecord?.hemoglobin || 0) < 11.0 ? 'drifting' : 'nominal', statusLabel: (latestRecord?.hemoglobin || 0) < 11.0 ? 'Low' : 'Normal' },
          { label: 'Maternal BMI', value: latestRecord?.bmi || 24.5, unit: 'kg/m²', status: 'nominal', statusLabel: 'In Spec' },
          { label: 'HPV Status', value: latestRecord?.hpvStatus ? latestRecord.hpvStatus.replace('_', ' ') : 'Negative', unit: '', status: 'nominal', statusLabel: 'Detected' },
        ].map((metric, i) => (
          <div key={i} className="panel-precision p-5 rounded-2xl flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold metric-readout text-slate-900">{metric.value}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">{metric.unit}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
              <span className={`status-dot status-${metric.status}`} />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">{metric.statusLabel}</span>
            </div>
          </div>
        ))}
      </section>

      {/* 4. CLINICAL NUTRITION (DAILY MEAL PLAN) */}
      <section className="panel-precision p-8 rounded-[2rem] space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today's Protocol</h3>
              <p className="text-lg font-bold text-slate-900 tracking-tight">Precision Clinical Nutrition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Calorie Target</span>
              <span className="text-xs font-bold text-emerald-700">{nutritionPlan?.dailyCalorieTarget || 1800} kcal/day</span>
            </div>
            <button onClick={onOpenNutritionModal} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Full 7-Day Plan
            </button>
          </div>
        </div>

        {nutritionPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Breakfast', time: '08:00', meal: nutritionPlan.sevenDayMealPlan[0].breakfast },
              { label: 'Morning Snack', time: '11:00', meal: nutritionPlan.sevenDayMealPlan[0].morningSnack },
              { label: 'Lunch', time: '13:30', meal: nutritionPlan.sevenDayMealPlan[0].lunch },
              { label: 'Evening Snack', time: '17:00', meal: nutritionPlan.sevenDayMealPlan[0].eveningSnack },
              { label: 'Dinner', time: '19:30', meal: nutritionPlan.sevenDayMealPlan[0].dinner },
              { label: 'Bedtime', time: '21:30', meal: nutritionPlan.sevenDayMealPlan[0].bedtimeSnack },
            ].map((slot, i) => (
              <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-2 group hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{slot.label}</span>
                  <span className="text-[9px] font-mono text-slate-400">{slot.time}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 min-h-[2rem]">
                    {slot.meal?.name || 'Standard Protocol'}
                  </p>
                  <p className="text-[9px] text-slate-500 italic">
                    {slot.meal?.portion || 'Controlled portion'}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                    {slot.meal?.calories || 150} kcal
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium italic">Regenerating nutritional vectors based on latest vitals...</p>
          </div>
        )}
      </section>

      {/* 5. REALTIME COMMUNICATION & ADHERENCE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 panel-precision p-8 rounded-3xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Direct Consultation Channel</h3>
                <p className="text-xs text-slate-500 font-medium">Dr. Ananya Sharma, MD · End-to-End Encrypted</p>
              </div>
            </div>
            <button onClick={onOpenCommunication} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors border border-indigo-200">
              Initiate Secure Session
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                <span className="status-dot status-nominal animate-pulse" />
                Latest Physician Directive
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;Your fasting values are within the calibration range. Continue current nutrition protocols. Next scheduled biometric capture in 48 hours.&rdquo;
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <Shield className="w-3 h-3" />
                Verified Thread
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <Clock className="w-3 h-3" />
                Latency: 0.4s
              </div>
            </div>
          </div>
        </div>

        <div className="panel-precision p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Micronutrient Adherence</h3>
              <p className="text-xs text-slate-500 font-medium">WHO Standard Protocols</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { name: 'IFA (Iron + Folic Acid)', scheduled: '09:00', status: 'Completed' },
              { name: 'Calcium + Vit D3', scheduled: '14:00', status: 'Completed' },
              { name: 'Omega-3 / DHA', scheduled: '20:00', status: 'Pending' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-3">
                  {item.status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">T: {item.scheduled}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button onClick={onOpenDataModal} className="w-full py-3 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            Manage Reminders
          </button>
        </div>
      </section>

      {/* 5. LONGITUDINAL TELEMETRY (TRENDS) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendLineChart
          data={glucoseChartData}
          title="Glycemic Variance"
          unit="mg/dL"
          primaryLabel="Post-Prandial"
          secondaryLabel="Fasting"
          targetMax={140}
        />

        <TrendLineChart
          data={bpChartData}
          title="Vascular Pressure Telemetry"
          unit="mmHg"
          primaryLabel="Systolic"
          secondaryLabel="Diastolic"
          targetMax={130}
        />
      </section>

      {/* 6. CLINICAL NOTES FEEDS */}
      <section className="panel-precision p-8 rounded-[2rem] space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Clinical Assessment Logs</h3>
              <p className="text-xs text-slate-500 font-medium">Verified Physician Entries</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {doctorNotes.length > 0 ? (
            doctorNotes.slice(0, 2).map((note, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{new Date(note.timestamp).toLocaleDateString()}</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{note.doctorName}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{note.noteText}</p>
                <div className="pt-4 border-t border-slate-200/60 flex flex-wrap gap-2">
                  {note.recommendations.map((rec, rIdx) => (
                    <span key={rIdx} className="text-[10px] font-bold bg-white text-slate-600 px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                      ● {rec}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
              No clinical telemetry notes archived.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
