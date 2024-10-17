'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, SearchIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface User {
  id: string;
  firstName: string;
  email: string;
}

type AttendanceStatus = "present" | "absent" | null;

interface AttendanceRecord {
  userId: string;
  isPresent: boolean;
}

interface AttendanceUpdate {
  userId: string;
  status: AttendanceStatus;
}

const AttendancePage = () => {
  const params = useParams();
  const [date, setDate] = useState<Date>(new Date());
  const [members, setMembers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [pendingUpdates, setPendingUpdates] = useState<AttendanceUpdate[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast({ title: "Error", description: "Failed to fetch class members.", variant: "destructive" });
    }
  }, [params.id]);

  const fetchAttendance = useCallback(async () => {
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/attendance`, {
        params: { date: format(date, 'yyyy-MM-dd') }
      });
      const attendanceData = response.data.reduce((acc: Record<string, AttendanceStatus>, record: AttendanceRecord) => {
        acc[record.userId] = record.isPresent ? "present" : "absent";
        return acc;
      }, {});
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast({ title: "Error", description: "Failed to fetch attendance data.", variant: "destructive" });
    }
  }, [params.id, date]);

  useEffect(() => {
    fetchMembers();
    fetchAttendance();
  }, [date, params.id, fetchMembers, fetchAttendance]);

  const batchUpdateAttendance = useCallback(async () => {
    try {
      await axios.post(`/api/classrooms/${params.id}/attendance/batch`, {
        date: format(date, 'yyyy-MM-dd'),
        updates: pendingUpdates
      });
      setPendingUpdates([]);
      toast({ title: "Success", description: "Attendance updated successfully." });
    } catch (error) {
      console.error('Failed to update attendance:', error);
      toast({ title: "Error", description: "Failed to update attendance. Please try again.", variant: "destructive" });
    }
  }, [params.id, date, pendingUpdates]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pendingUpdates.length > 0) {
        batchUpdateAttendance();
      }
    }, 2500); // 2.5 seconds debounce

    return () => clearTimeout(timer);
  }, [pendingUpdates, batchUpdateAttendance]);

  const updateAttendance = useCallback((userId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [userId]: status }));
    setPendingUpdates(prev => [...prev, { userId, status }]);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member => 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTableElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : 0;
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev < filteredMembers.length - 1 ? prev + 1 : filteredMembers.length - 1;
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      case 'p':
      case 'P':
        updateAttendance(filteredMembers[focusedIndex].id, "present");
        break;
      case 'a':
      case 'A':
        updateAttendance(filteredMembers[focusedIndex].id, "absent");
        break;
    }
  }, [focusedIndex, filteredMembers, updateAttendance]);

  const scrollToIndex = (index: number) => {
    if (tableRef.current) {
      const tableRows = tableRef.current.querySelectorAll('tbody tr');
      if (tableRows[index]) {
        tableRows[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="text-sm text-muted-foreground">
              Use arrow keys to navigate. Press &apos;P&apos; for Present, &apos;A&apos; for Absent.
            </div>
          </div>
          <div className="relative w-64">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Attendance List</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={tableRef} tabIndex={0} onKeyDown={handleKeyDown} className="outline-none max-h-[calc(100vh-300px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member, index) => (
                    <TableRow 
                      key={member.id}
                      className={cn(
                        focusedIndex === index && "bg-primary/20 outline outline-2 outline-primary",
                        "transition-colors duration-200"
                      )}
                    >
                      <TableCell>{member.firstName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {attendance[member.id] === "present" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Present</span>
                        ) : attendance[member.id] === "absent" ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Absent</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;
