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
import { CalendarIcon, SearchIcon, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import React from 'react'

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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNo?: string;
  srn?: string;
  prn?: string;
  division?: string;
  year?: string;
}

const AttendancePage = () => {
  const params = useParams();
  const [date, setDate] = useState<Date>(new Date());
  const [members, setMembers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [pendingUpdates, setPendingUpdates] = useState<AttendanceUpdate[]>([]);
  const [stats, setStats] = useState<{
    totalPresent: number;
    totalAbsent: number;
    percentage: number;
  }>({ totalPresent: 0, totalAbsent: 0, percentage: 0 });
  const tableRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/classrooms/${params.id}/members`);
      
      const attendanceResponse = await axios.get(`/api/classrooms/${params.id}/attendance`, {
        params: { date: format(date, 'yyyy-MM-dd') }
      });

      setMembers(response.data.members || []);

      const attendanceData = attendanceResponse.data.reduce((acc: Record<string, AttendanceStatus>, record: AttendanceRecord) => {
        acc[record.userId] = record.isPresent ? "present" : "absent";
        return acc;
      }, {});
      setAttendance(attendanceData);

      setTotalPages(Math.ceil((response.data.members?.length || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch class data.", 
        variant: "destructive" 
      });
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, date]);

  useEffect(() => {
    fetchMembers();
  }, [date, params.id, fetchMembers]);

  useEffect(() => {
    const present = Object.values(attendance).filter(status => status === "present").length;
    const absent = Object.values(attendance).filter(status => status === "absent").length;
    const total = present + absent;
    setStats({
      totalPresent: present,
      totalAbsent: absent,
      percentage: total ? (present / total) * 100 : 0
    });
  }, [attendance]);

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
    if (!members) return [];
    if (!searchQuery.trim()) return members;
    
    return members.filter(member => {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.rollNo?.toLowerCase().includes(searchLower) ||
        member.srn?.toLowerCase().includes(searchLower) ||
        member.prn?.toLowerCase().includes(searchLower) ||
        member.division?.toLowerCase().includes(searchLower) ||
        member.year?.toLowerCase().includes(searchLower)
      );
    });
  }, [members, searchQuery]);

  const paginatedMembers = useMemo(() => {
    if (!filteredMembers) return [];
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage]);

  useEffect(() => {
    if (!filteredMembers) return;
    setTotalPages(Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  }, [filteredMembers]);

  const markAllPresent = useCallback(() => {
    if (!filteredMembers) return;
    filteredMembers.forEach(member => updateAttendance(member.id, "present"));
  }, [filteredMembers, updateAttendance]);

  const markAllAbsent = useCallback(() => {
    if (!filteredMembers) return;
    filteredMembers.forEach(member => updateAttendance(member.id, "absent"));
  }, [filteredMembers, updateAttendance]);

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
          const newIndex = prev < paginatedMembers.length - 1 ? prev + 1 : paginatedMembers.length - 1;
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      case 'p':
      case 'P':
        if (paginatedMembers[focusedIndex]) {
          updateAttendance(paginatedMembers[focusedIndex].id, "present");
        }
        break;
      case 'a':
      case 'A':
        if (paginatedMembers[focusedIndex]) {
          updateAttendance(paginatedMembers[focusedIndex].id, "absent");
        }
        break;
    }
  }, [focusedIndex, paginatedMembers, updateAttendance]);

  const scrollToIndex = (index: number) => {
    if (tableRef.current) {
      const tableRows = tableRef.current.querySelectorAll('tbody tr');
      if (tableRows[index]) {
        tableRows[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-green-600">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPresent} students</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-red-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAbsent} students</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-600">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.percentage.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={markAllPresent}
              >
                Mark All Present
              </Button>
              <Button 
                variant="outline"
                className="text-red-600" 
                onClick={markAllAbsent}
              >
                Mark All Absent
              </Button>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll no, SRN..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Attendance List</span>
              <span className="text-sm text-muted-foreground">
                Use arrow keys to navigate. Press 'P' for Present, 'A' for Absent.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={tableRef} tabIndex={0} onKeyDown={handleKeyDown} className="outline-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SRN/PRN</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : paginatedMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMembers.map((member, index) => (
                      <TableRow 
                        key={member.id}
                        className={cn(
                          focusedIndex === index && "bg-primary/20 outline outline-2 outline-primary",
                          "transition-colors duration-200"
                        )}
                      >
                        <TableCell>{member.rollNo || "-"}</TableCell>
                        <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                        <TableCell>{member.srn || member.prn || "-"}</TableCell>
                        <TableCell>{member.division || "-"}</TableCell>
                        <TableCell>{member.year || "-"}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded",
                            attendance[member.id] === "present" && "bg-green-100 text-green-800",
                            attendance[member.id] === "absent" && "bg-red-100 text-red-800"
                          )}>
                            {attendance[member.id] ? (
                              attendance[member.id]!.charAt(0).toUpperCase() + attendance[member.id]!.slice(1)
                            ) : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={attendance[member.id] === "present" ? "default" : "outline"}
                              onClick={() => updateAttendance(member.id, "present")}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance[member.id] === "absent" ? "default" : "outline"}
                              onClick={() => updateAttendance(member.id, "absent")}
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {paginatedMembers.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers?.length || 0)} of{' '}
                  {filteredMembers?.length || 0} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const distance = Math.abs(page - currentPage);
                        return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            disabled={isLoading}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;
