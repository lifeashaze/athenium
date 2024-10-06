'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { format, eachDayOfInterval, addDays } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckIcon, XIcon, UserIcon, SearchIcon, DownloadIcon, CalendarIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

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

const AttendancePage = () => {
  const params = useParams();
  const [date, setDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });
  const [members, setMembers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMembers();
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, params.id]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast({ title: "Error", description: "Failed to fetch class members.", variant: "destructive" });
    }
  };

  const fetchAttendance = async () => {
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
  };

  const updateAttendance = (userId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [userId]: status }));
  };

  const saveAttendance = async () => {
    try {
      const attendanceData = Object.entries(attendance).map(([userId, status]) => ({
        userId,
        isPresent: status === "present"
      }));

      await axios.post(`/api/classrooms/${params.id}/attendance`, {
        date: format(date, 'yyyy-MM-dd'),
        attendance: attendanceData
      });

      toast({ title: "Success", description: "Attendance saved successfully." });
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast({ title: "Error", description: "Failed to save attendance.", variant: "destructive" });
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0 };
    Object.values(attendance).forEach(status => {
      if (status) counts[status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const generateReport = async () => {
    try {
      if (!dateRange.from || !dateRange.to) {
        toast({ title: "Error", description: "Please select both start and end dates.", variant: "destructive" });
        return;
      }

      const dates = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const report = await Promise.all(dates.map(async (date) => {
        const response = await axios.get(`/api/classrooms/${params.id}/attendance`, {
          params: { date: format(date, 'yyyy-MM-dd') }
        });
        return { date, attendance: response.data };
      }));

      const csv = [
        ["Date", "Name", "Email", "Status"],
        ...report.flatMap(({ date, attendance }) => 
          members.map(member => [
            format(date, 'yyyy-MM-dd'),
            member.firstName,
            member.email,
            attendance.find((a: AttendanceRecord) => a.userId === member.id)?.isPresent ? "Present" : "Absent"
          ])
        )
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_report_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Attendance Management</h1>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2" />
                Today&apos;s Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{format(new Date(), 'MMMM d, yyyy')}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge className="mb-2 bg-green-500">
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Present
                  </Badge>
                  <p className="text-2xl font-bold">{statusCounts.present}</p>
                </div>
                <div className="text-center">
                  <Badge className="mb-2 bg-red-500">
                    <XIcon className="w-4 h-4 mr-1" />
                    Absent
                  </Badge>
                  <p className="text-2xl font-bold">{statusCounts.absent}</p>
                </div>
                <div className="text-center">
                  <Badge className="mb-2 bg-blue-500">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Total
                  </Badge>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    className="rounded-md border w-full"
                  />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Attendance List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="search">Search Attendees</Label>
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[calc(100vh-400px)] rounded-md border">
                    <div className="space-y-4 p-4">
                      {filteredMembers.map(member => (
                        <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow">
                          <div>
                            <span className="font-medium">{member.firstName}</span>
                            <span className="text-sm text-gray-500 ml-2">{member.email}</span>
                          </div>
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button
                              size="sm"
                              variant={attendance[member.id] === "present" ? "default" : "outline"}
                              onClick={() => updateAttendance(member.id, "present")}
                            >
                              <CheckIcon className="w-4 h-4 mr-1" /> Present
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance[member.id] === "absent" ? "default" : "outline"}
                              onClick={() => updateAttendance(member.id, "absent")}
                            >
                              <XIcon className="w-4 h-4 mr-1" /> Absent
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button onClick={saveAttendance} className="mt-4 w-full">Save Attendance</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Select a date range and generate a CSV report of the attendance.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="from">From</Label>
                    <Calendar
                      id="from"
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="to">To</Label>
                    <Calendar
                      id="to"
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      className="rounded-md border"
                      disabled={(date) => date < (dateRange.from || new Date())}
                    />
                  </div>
                </div>
                <Button onClick={generateReport} disabled={!dateRange.from || !dateRange.to}>
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download Attendance Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AttendancePage;