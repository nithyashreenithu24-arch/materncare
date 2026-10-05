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
  TrendingUp,
  Pill,
  Bell,
  ShieldCheck,
  Shield,
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

  // Prep glucose chart data
  const glucoseChartData = records.map((r, i) => ({
    label: r.gestationalWeeks ? `Wk ${r.gestationalWeeks}` : `Entry ${i + 1}`,
    value: r.postPrandialBloodSugar,
    secondaryValue: r.fastingBloodSugar,
  }));

  // Prep blood pressure chart data
  const bpChartData = records.map((r, i) => ({
    label: r.gestationalWeeks ? `Wk ${r.gestationalWeeks}` : `Entry ${i + 1}`,
    value: r.bloodPressureSys,
    secondaryValue: r.bloodPressureDia,
  }));

  return (
    <div className="space-y-6">
      {/* Patient Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-rose-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-rose-100">
                {latestRecord?.gestationalWeeks ? `Gestational Week ${latestRecord.gestationalWeeks}` : 'Maternal Health Profile'}
              </span>
              <span className="text-xs text-rose-100/90 font-medium">Gravida {latestRecord?.gravidity || 1}, Para {latestRecord?.parity || 0}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {patient.name}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl leading-relaxed">
              Continuous AI-assisted monitoring for gestational diabetes and cervical wellness. Your individualized nutrition and screening plan are active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDataModal}
              className="px-4 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Log Today&apos;s Vitals</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Health Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Risk Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GDM Prediction */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gestational Diabetes Risk</h3>
                  <p className="text-xs text-slate-500">PIMA &amp; Antenatal Metabolic Model</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {predictions?.gdm.modelVersion || 'v1.2.4'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <RiskGauge
                score={predictions?.gdm.scorePercentage || 25}
                category={predictions?.gdm.riskCategory || 'Low'}
                title="GDM Probability"
                subtitle="Based on blood glucose, pre-pregnancy BMI &amp; parity"
                size={170}
              />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Clinical Directive</p>
                  <p className="text-xs text-slate-700 leading-snug">
                    {predictions?.gdm.clinicalAction || 'Routine prenatal surveillance. Target fasting glucose ≤ 95 mg/dL.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Next glucose screening due in: <strong>{predictions?.gdm.recommendedFollowUpDays || 28} days</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            {predictions?.gdm.topFactors && (
              <FeatureContributionList
                factors={predictions.gdm.topFactors.slice(0, 3)}
                title="Primary Factors Affecting Your GDM Score"
              />
            )}
          </div>
        </div>

        {/* Cervical Cancer Risk */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cervical Health &amp; Dysplasia Risk</h3>
                  <p className="text-xs text-slate-500">WHO &amp; HPV Stratified Predictive Tree</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {predictions?.cervical.modelVersion || 'v1.1.8'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <RiskGauge
                score={predictions?.cervical.scorePercentage || 12}
                category={predictions?.cervical.riskCategory || 'Low'}
                title="Cervical Risk Index"
                subtitle="Calculated from HPV status, cytology &amp; lifestyle factors"
                size={170}
              />
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Clinical Protocol</p>
                  <p className="text-xs text-slate-700 leading-snug">
                    {predictions?.cervical.clinicalAction || 'Continue routine 3-year Pap/HPV screening.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Next screening review in: <strong>{predictions?.cervical.recommendedFollowUpDays || 365} days</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            {predictions?.cervical.topFactors && (
              <FeatureContributionList
                factors={predictions.cervical.topFactors.slice(0, 3)}
                title="Key Cervical Markers Explained"
              />
            )}
          </div>
        </div>
      </div>

      {/* Key Maternal Vitals Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Blood Pressure</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {latestRecord?.bloodPressureSys || 120}/{latestRecord?.bloodPressureDia || 80}
            </span>
            <span className="text-[10px] text-slate-400">mmHg</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Optimal Range
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Post-Meal Sugar</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {latestRecord?.postPrandialBloodSugar || 118}
            </span>
            <span className="text-[10px] text-slate-400">mg/dL</span>
          </div>
          <span
            className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded ${
              (latestRecord?.postPrandialBloodSugar || 0) > 140
                ? 'text-rose-700 bg-rose-50'
                : (latestRecord?.postPrandialBloodSugar || 0) > 120
                ? 'text-amber-700 bg-amber-50'
                : 'text-emerald-700 bg-emerald-50'
            }`}
          >
            {(latestRecord?.postPrandialBloodSugar || 0) > 140 ? 'Elevated' : (latestRecord?.postPrandialBloodSugar || 0) > 120 ? 'Borderline' : 'Normal'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fasting Sugar</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {latestRecord?.fastingBloodSugar || 90}
            </span>
            <span className="text-[10px] text-slate-400">mg/dL</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Target ≤ 95
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hemoglobin</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {latestRecord?.hemoglobin || 11.2}
            </span>
            <span className="text-[10px] text-slate-400">g/dL</span>
          </div>
          <span
            className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded ${
              (latestRecord?.hemoglobin || 0) < 11.0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
            }`}
          >
            {(latestRecord?.hemoglobin || 0) < 11.0 ? 'Mild Anemia' : 'Normal'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maternal BMI</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {latestRecord?.bmi || 24.5}
            </span>
            <span className="text-[10px] text-slate-400">kg/m²</span>
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Weight: {latestRecord?.weightKg || 60} kg
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pap / HPV Status</span>
          <div className="mt-1">
            <p className="text-xs font-bold text-slate-900 capitalize">
              {latestRecord?.hpvStatus ? latestRecord.hpvStatus.replace('_', ' ') : 'Negative'}
            </p>
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            Cytology: {latestRecord?.papSmearHistory === 'abnormal_recent' ? 'Review Needed' : 'Normal'}
          </span>
        </div>
      </div>

      {/* Prenatal Supplement Adherence & Active Profile Reminders Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Daily Prenatal Supplement Adherence</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded-full font-semibold">
                  {latestRecord?.supplementAdherence?.adherenceRating || 'Full'} Adherence
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">WHO &amp; FOGSI standard maternal micro-nutrient routine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patient.supplementReminderEnabled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                <Bell className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
                <span>Daily Reminder: {patient.supplementReminderTime || '09:00 AM'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <span>Reminders Muted</span>
              </span>
            )}

            <button
              onClick={onOpenDataModal}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 transition-colors"
            >
              Update Log &amp; Reminders
            </button>
          </div>
        </div>

        {/* 4 Core Prenatal Supplement Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5">
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-slate-800">Iron &amp; Folic Acid</p>
              <p className="text-[10px] text-slate-500">60mg Fe + 400mcg Folate</p>
              <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Taken Today
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-slate-800">Calcium &amp; Vit D3</p>
              <p className="text-[10px] text-slate-500">500mg (2h after Iron)</p>
              <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Taken Today
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-slate-800">Prenatal Multivitamin</p>
              <p className="text-[10px] text-slate-500">Zinc, Iodine, B-Complex</p>
              <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Taken Today
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-slate-800">Omega-3 / DHA</p>
              <p className="text-[10px] text-slate-500">200mg Fetal Brain DHA</p>
              <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Taken Today
              </span>
            </div>
          </div>
        </div>

        {patient.supplementReminderEnabled && (
          <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-700 bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-indigo-100">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Reminder preference saved to your profile: Daily notifications active at {patient.supplementReminderTime || '09:00 AM'}.
            </span>
            <span className="text-[10px] text-indigo-500 hidden sm:inline">Profile Synced</span>
          </div>
        )}
      </div>

      {/* Longitudinal Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendLineChart
          data={glucoseChartData}
          title="Maternal Blood Sugar Profile Over Time"
          unit="mg/dL"
          primaryLabel="2hr Post-Prandial"
          secondaryLabel="Fasting Blood Glucose"
          targetMax={140}
        />

        <TrendLineChart
          data={bpChartData}
          title="Blood Pressure Progression"
          unit="mmHg"
          primaryLabel="Systolic (mmHg)"
          secondaryLabel="Diastolic (mmHg)"
          targetMax={130}
        />
      </div>

      {/* Bottom Hub: Nutrition Quick Banner + Doctor Clinical Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutrition Plan Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-3xl p-6 border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personalized Prenatal Nutrition Plan</h3>
                  <p className="text-xs text-slate-500">7-Day Glycemic Control &amp; Iron Bioavailability Guide</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {nutritionPlan?.dailyCalorieTarget || 1800} kcal/day
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Carbs (Low GI)</span>
                <p className="text-sm font-bold text-blue-600">{nutritionPlan?.macroDistribution.carbsGrams || 195}g</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Protein</span>
                <p className="text-sm font-bold text-emerald-600">{nutritionPlan?.macroDistribution.proteinGrams || 110}g</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Healthy Fats</span>
                <p className="text-sm font-bold text-amber-600">{nutritionPlan?.macroDistribution.fatGrams || 60}g</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored for <strong>{nutritionPlan?.dietaryPreference || 'vegetarian'}</strong> preferences. Emphasizes complex carbohydrates, split-snack timing to smooth maternal insulin curves, and pairing non-heme iron with Vitamin C.
            </p>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between border-t border-emerald-200/60">
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Doctor Approved Protocol
            </span>
            <button
              onClick={onOpenNutritionModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs"
            >
              <span>Explore 7-Day Meal Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor Clinical Notes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Physician Clinical Notes</h3>
                <p className="text-[11px] text-slate-500">
                  {doctorNotes[0]?.doctorName || (patient.assignedDoctorId === 'doc-2' ? 'Dr. Rajesh Varma, MD, DGO' : 'Dr. Ananya Sharma, MD')}
                </p>
              </div>
            </div>

            {doctorNotes.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700">
                  <p className="italic leading-relaxed">&ldquo;{doctorNotes[0].noteText}&rdquo;</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    Updated {new Date(doctorNotes[0].timestamp).toLocaleDateString()}
                  </p>
                </div>

                {doctorNotes[0].recommendations && doctorNotes[0].recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Items</span>
                    {doctorNotes[0].recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No notes logged by physician yet.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenChat}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Discuss results with MatraCare AI</span>
            </button>
          </div>
        </div>

        {/* Doctor-Patient Direct Messaging Channel Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Direct Doctor Communication</h3>
                  <p className="text-[11px] text-slate-300">
                    {patient.assignedDoctorId === 'doc-2' ? 'Dr. Rajesh Varma, MD (Gynae-Oncology)' : 'Dr. Ananya Sharma, MD (OB/GYN)'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] text-indigo-200">
                <span className="font-semibold">Recent Physician Reply:</span>
                <span>2 hours ago</span>
              </div>
              <p className="text-slate-100 text-[11px] leading-relaxed italic">
                &ldquo;92 mg/dL fasting is right in our target zone. Keep up steady hydration and supplement adherence...&rdquo;
              </p>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>End-to-end encrypted clinical messaging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Average clinician response time: &lt; 2 hours</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={onOpenCommunication}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Doctor Communication Panel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
