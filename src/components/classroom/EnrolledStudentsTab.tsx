import React from 'react';
import { Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string;
  firstName: string;
  email: string;
  role: string;
}

interface EnrolledStudentsTabProps {
  members: User[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function getRoleBadgeColor(role: string) {
  const roleColors = {
    student: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    professor: "bg-green-100 text-green-800 hover:bg-green-200",
    admin: "bg-red-100 text-red-800 hover:bg-red-200",
  };
  return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const EnrolledStudentsTab: React.FC<EnrolledStudentsTabProps> = ({
  members,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange
}) => {
  const paginatedMembers = members.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Enrolled Students
        </CardTitle>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{member.firstName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(member.role)} transition-colors duration-200`}>
                          {capitalizeFirstLetter(member.role)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, members.length)} of {members.length} members
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No students enrolled in this course yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
