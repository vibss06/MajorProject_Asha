import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight, Filter } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import type { MaatrTask } from '../types';

interface TasksScheduleSectionProps {
  onSelectBeneficiary: (id: string) => void;
  onOpenRecordANC: (id: string) => void;
}

export const TasksScheduleSection: React.FC<TasksScheduleSectionProps> = ({
  onSelectBeneficiary,
  onOpenRecordANC,
}) => {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const tasks = maatrStore.getTasks();

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleToggleComplete = (task: MaatrTask) => {
    maatrStore.completeTask(task.id);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Visit Schedule & Clinical Tasks</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Automatically generated action items for upcoming ANC checkups, postnatal checkpoints, and emergency follow-ups.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200">
          {(['pending', 'completed', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === mode
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Task Feed */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isHigh = task.priority === 'HIGH';
            const isUrgent = task.visitType === 'Danger Sign Escalation';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isUrgent
                    ? 'border-rose-400 bg-rose-50/20'
                    : isHigh
                    ? 'border-amber-300'
                    : isCompleted
                    ? 'border-stone-200 opacity-70'
                    : 'border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-stone-300 hover:border-emerald-600 bg-white'
                    }`}
                    title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-sm">
                        {task.visitType}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-stone-600">{task.reason}</p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                      <span>
                        Beneficiary:{' '}
                        <button
                          onClick={() => onSelectBeneficiary(task.beneficiaryId)}
                          className="font-bold text-slate-700 hover:text-emerald-700 underline"
                        >
                          {task.beneficiaryName}
                        </button>
                      </span>
                      <span>• Due: <strong className="text-slate-700">{task.dueDate}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isCompleted && task.visitType.startsWith('ANC') && (
                    <button
                      onClick={() => onOpenRecordANC(task.beneficiaryId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Record Visit
                    </button>
                  )}
                  {!isCompleted && !task.visitType.startsWith('ANC') && (
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      Complete
                    </button>
                  )}
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
