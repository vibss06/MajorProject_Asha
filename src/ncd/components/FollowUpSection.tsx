import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, ArrowRight, Clock, User } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import type { NCDFollowupTask } from '../types';

interface FollowUpSectionProps {
  onSelectBeneficiary: (id: string) => void;
  onOpenScreening: (id: string) => void;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  onSelectBeneficiary,
  onOpenScreening,
}) => {
  const [filter, setFilter] = useState<'Pending' | 'Visit completed' | 'Referred' | 'Clinical assessment completed' | 'ALL'>('Pending');
  const tasks = ncdStore.getTasks();

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const handleUpdateStatus = (taskId: string, status: NCDFollowupTask['status']) => {
    ncdStore.updateTaskStatus(taskId, status);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">NCD Follow-Up Management</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Automatically scheduled home visits, BP/glucose re-testing, and compliance checks for identified high-risk cases.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 overflow-x-auto max-w-full">
          {(['Pending', 'Visit completed', 'Referred', 'ALL'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === mode
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {mode === 'ALL' ? 'All Tasks' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Task Feed */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isPending = task.status === 'Pending';
            const isHigh = task.priority === 'HIGH';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                  isHigh && isPending
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-stone-200 hover:border-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                        isHigh ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {task.priority.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectBeneficiary(task.beneficiaryId)}
                          className="font-extrabold text-slate-800 text-sm hover:text-emerald-700 underline text-left"
                        >
                          {task.beneficiaryName}
                        </button>
                        <span className="text-[10px] text-stone-400">({task.beneficiaryId})</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Due Date: <strong className="text-slate-800">{task.dueDate}</strong> • Assigned: {task.assignedAsha}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-stone-500">Update:</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                      className="px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold bg-white outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Visit completed">Visit Completed ✓</option>
                      <option value="Referred">Referred to PHC</option>
                      <option value="Clinical assessment completed">Clinical Assessment Done</option>
                      <option value="Follow-up required">Follow-up Required</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-stone-700 font-medium leading-relaxed">{task.reason}</p>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => onOpenScreening(task.beneficiaryId)}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Perform Follow-up Re-Screening</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(task.id, 'Visit completed')}
                    className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No tasks in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
