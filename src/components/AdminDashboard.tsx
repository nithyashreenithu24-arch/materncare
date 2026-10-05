import React, { useState, useEffect } from 'react';
import { User, AdminStats, AuditLog, ModelMetric } from '../types';
import { api } from '../api';
import {
  ShieldAlert,
  Users,
  Database,
  RefreshCw,
  UploadCloud,
  CheckCircle,
  FileText,
  Sliders,
  TrendingUp,
  Cpu,
  Layers,
  History,
  Activity,
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: User;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<{ gdm: ModelMetric; cervical: ModelMetric } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccessMsg, setRetrainSuccessMsg] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [s, u, l, m] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminLogs(),
        api.getMLMetrics(),
      ]);
      setStats(s);
      setUsers(u);
      setLogs(l);
      setMetrics(m);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccessMsg('');
    try {
      // If a file was uploaded, pass it as GDM or Cervical depending on name
      const isCervical = selectedFileName.toLowerCase().includes('cervical');
      const res = await api.retrainModels(
        isCervical ? undefined : selectedFileContent || undefined,
        isCervical ? selectedFileContent || undefined : undefined
      );
      setMetrics(res.metrics);
      setRetrainSuccessMsg(`Model successfully retrained! Updated GDM: ${res.metrics.gdm.version}, Cervical: ${res.metrics.cervical.version}`);
      setSelectedFileContent(null);
      setSelectedFileName('');
      await loadAdminData();
    } catch (err: any) {
      console.error('Retraining failed:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        <span>Loading Admin Registry &amp; Model Weights...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-amber-100 font-semibold text-xs border border-white/20 uppercase tracking-wider">
              System Administration &amp; MLOps
            </span>
            <span className="text-xs text-amber-100/80">Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Platform Governance &amp; ML Model Registry</h1>
          <p className="text-xs text-amber-100/90 mt-1">
            Supervise clinical cohorts, audit access logs, inspect feature weight parameters, and trigger retrain runs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cohort</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats?.totalPatients} Patients • {stats?.totalDoctors} Doctors
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inference Queries</span>
            <Cpu className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.modelUsageCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Predictions executed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">GDM Model Acc.</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {((stats?.gdmAccuracy || 0.84) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{stats?.gdmModelVersion}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cervical Model Acc.</span>
            <TrendingUp className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {((stats?.cervicalAccuracy || 0.89) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{stats?.cervicalModelVersion}</p>
        </div>
      </div>

      {/* Model Registry & Retraining Workflow Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              Machine Learning Model Operations &amp; Versioning
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervised clinical classification algorithms grounded in PIMA Indian Diabetes &amp; Cervical Risk cohorts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200">
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span>{selectedFileName ? selectedFileName.slice(0, 16) + '...' : 'Upload New CSV'}</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Retraining...' : 'Trigger Retrain Workflow'}</span>
            </button>
          </div>
        </div>

        {retrainSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{retrainSuccessMsg}</span>
          </div>
        )}

        {/* Models Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GDM Model Specs */}
          {metrics?.gdm && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Gestational Diabetes Model</h3>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{metrics.gdm.version}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Active in Production
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">ROC-AUC</span>
                  <span className="font-extrabold text-slate-900">{metrics.gdm.rocAuc}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Precision</span>
                  <span className="font-extrabold text-slate-900">{metrics.gdm.precision}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Recall</span>
                  <span className="font-extrabold text-slate-900">{metrics.gdm.recall}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">F1-Score</span>
                  <span className="font-extrabold text-slate-900">{metrics.gdm.f1Score}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Top Feature Weights</span>
                <div className="space-y-1.5">
                  {metrics.gdm.featureWeights.map((fw, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{fw.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${fw.weight * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                          {fw.weight.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cervical Cancer Model Specs */}
          {metrics?.cervical && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cervical Neoplasia Model</h3>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{metrics.cervical.version}</p>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                  Active in Production
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">ROC-AUC</span>
                  <span className="font-extrabold text-slate-900">{metrics.cervical.rocAuc}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Precision</span>
                  <span className="font-extrabold text-slate-900">{metrics.cervical.precision}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Recall</span>
                  <span className="font-extrabold text-slate-900">{metrics.cervical.recall}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">F1-Score</span>
                  <span className="font-extrabold text-slate-900">{metrics.cervical.f1Score}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Top Feature Weights</span>
                <div className="space-y-1.5">
                  {metrics.cervical.featureWeights.map((fw, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{fw.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full"
                            style={{ width: `${fw.weight * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                          {fw.weight.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Management & Role-Based Access Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          User Registry &amp; Role Assignments
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Location / Facility</th>
                <th className="py-2.5 px-3">Current Role</th>
                <th className="py-2.5 px-3 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3 text-slate-500">{u.clinicLocation || 'General Care'}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold capitalize border ${
                        u.role === 'admin'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : u.role === 'doctor'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Audit Trail */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          Security Audit Trail (HIPAA / Disa Compliance)
        </h2>

        <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Action Type</th>
                <th className="py-2 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-sans font-medium">{log.userName}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
