'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, Clock, BedDouble, AlertCircle } from 'lucide-react';

export default function HousekeepingBoardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, rRes] = await Promise.all([
        apiRequest('/housekeeping/tasks'),
        apiRequest('/rooms'),
      ]);
      setTasks(tRes || []);
      setRooms(rRes || []);
    } catch (err: any) {
      toast.error('Failed to load housekeeping board: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await apiRequest(`/housekeeping/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast.success(`Task status changed to ${status}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task');
    }
  };

  const handleRoomCleanToggle = async (roomId: string, currentHk: string) => {
    const nextHk = currentHk === 'CLEAN' ? 'DIRTY' : 'CLEAN';
    try {
      await apiRequest(`/rooms/${roomId}/housekeeping`, {
        method: 'PATCH',
        body: JSON.stringify({ housekeepingStatus: nextHk }),
      });
      toast.success(`Room housekeeping status updated to ${nextHk}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update room');
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Housekeeping & Turnover Board</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Live room cleanliness, linen change turnover tasks, and inspection workflows
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cleaning Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={`Housekeeping Tasks (${tasks.length})`}
              subtitle="Active cleaning assignments and checkout turnovers"
            />

            {loading ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No pending housekeeping tasks. All rooms are serviced!
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {tasks.map((task) => (
                  <div key={task.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#111827]">
                          Room {task.room?.roomNumber}
                        </span>
                        <Badge
                          variant={
                            task.status === 'COMPLETED'
                              ? 'success'
                              : task.status === 'IN_PROGRESS'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {task.status}
                        </Badge>
                        <Badge variant="neutral" size="sm">{task.taskType}</Badge>
                      </div>
                      <p className="text-xs text-[#64748B]">{task.notes || 'Routine cleaning and turnover'}</p>
                      {task.assignedToUser && (
                        <p className="text-[10px] text-[#0F766E] mt-0.5 font-medium">
                          Assigned to: {task.assignedToUser.firstName} {task.assignedToUser.lastName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                        >
                          Start Cleaning
                        </Button>
                      )}
                      {task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                          leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Mark Clean
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Quick Room Cleanliness Overview */}
        <div>
          <Card>
            <CardHeader title="Room Readiness Matrix" subtitle="Click any room to toggle clean status" />
            <div className="grid grid-cols-3 gap-2.5">
              {rooms.map((r) => {
                const isClean = r.housekeepingStatus === 'CLEAN';
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoomCleanToggle(r.id, r.housekeepingStatus)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isClean
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100'
                    }`}
                  >
                    <p className="font-extrabold text-sm">{r.roomNumber}</p>
                    <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider">
                      {r.housekeepingStatus}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
