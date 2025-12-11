"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Coffee, Plus, Pencil, Trash2, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  getProviderBreakTimes,
  createBreakTime,
  updateBreakTime,
  deleteBreakTime,
} from "@/actions/provider/update-provider-profile-action";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface BreakTime {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// Helper function to convert 24-hour time to 12-hour format
function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function BreakTimesComponent() {
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingBreakTime, setEditingBreakTime] = useState<BreakTime | null>(null);
  const [deletingBreakTimeId, setDeletingBreakTimeId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "Lunch Break",
    dayOfWeek: 1,
    startTime: "12:00",
    endTime: "13:00",
  });

  // Fetch break times on mount
  useEffect(() => {
    fetchBreakTimes();
  }, []);

  const fetchBreakTimes = async () => {
    setIsLoading(true);
    const result = await getProviderBreakTimes();
    if (result.success && result.data) {
      setBreakTimes(result.data);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (breakTime?: BreakTime) => {
    if (breakTime) {
      setEditingBreakTime(breakTime);
      setFormData({
        name: breakTime.name,
        dayOfWeek: breakTime.dayOfWeek,
        startTime: breakTime.startTime,
        endTime: breakTime.endTime,
      });
    } else {
      setEditingBreakTime(null);
      setFormData({
        name: "Lunch Break",
        dayOfWeek: 1,
        startTime: "12:00",
        endTime: "13:00",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isSaving) {
      setIsDialogOpen(false);
      setEditingBreakTime(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (editingBreakTime) {
        // Update existing
        const result = await updateBreakTime(editingBreakTime.id, formData);
        if (result.success) {
          toast.success("Break time updated successfully");
          await fetchBreakTimes();
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to update break time");
        }
      } else {
        // Create new
        const result = await createBreakTime(formData);
        if (result.success) {
          toast.success("Break time created successfully");
          await fetchBreakTimes();
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to create break time");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBreakTimeId) return;

    setIsDeleting(true);
    try {
      const result = await deleteBreakTime(deletingBreakTimeId);
      if (result.success) {
        toast.success("Break time deleted successfully");
        await fetchBreakTimes();
      } else {
        toast.error(result.error || "Failed to delete break time");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingBreakTimeId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingBreakTimeId(id);
    setIsDeleteDialogOpen(true);
  };

  // Group break times by day
  const breakTimesByDay = DAYS_OF_WEEK.map((day) => ({
    ...day,
    breaks: breakTimes.filter((bt) => bt.dayOfWeek === day.value),
  }));

  return (
    <Card className="gap-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <CardTitle className="text-slate-900 dark:text-white">Break Times</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={() => handleOpenDialog()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Break
          </Button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Set your break times to block off unavailable slots (e.g., lunch breaks)
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
          </div>
        ) : breakTimes.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No break times configured</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Add break times to automatically block off unavailable slots
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {breakTimesByDay
              .filter((day) => day.breaks.length > 0)
              .map((day) => (
                <div
                  key={day.value}
                  className="border border-slate-200 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-slate-900"
                >
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    {day.label}
                  </h4>
                  <div className="space-y-2">
                    {day.breaks.map((breakTime) => (
                      <div
                        key={breakTime.id}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                            <Coffee className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {breakTime.name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {formatTimeTo12Hour(breakTime.startTime)} -{" "}
                              {formatTimeTo12Hour(breakTime.endTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(breakTime)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(breakTime.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBreakTime ? "Edit Break Time" : "Add Break Time"}
            </DialogTitle>
            <DialogDescription>
              {editingBreakTime
                ? "Update the break time details below"
                : "Add a new break time to block off unavailable slots"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="break-name">Break Name</Label>
              <Input
                id="break-name"
                placeholder="e.g., Lunch Break"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-day">Day of Week</Label>
              <Select
                value={formData.dayOfWeek.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, dayOfWeek: parseInt(value) }))
                }
              >
                <SelectTrigger id="break-day" className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="break-start">Start Time</Label>
                <Input
                  id="break-start"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className="bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break-end">End Time</Label>
                <Input
                  id="break-end"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingBreakTime ? (
                "Update"
              ) : (
                "Add Break"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Break Time</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this break time? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
