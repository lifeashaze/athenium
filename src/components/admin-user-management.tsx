"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Search, Edit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for demonstration
const mockUsers = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ["student", "prof", "admin"][Math.floor(Math.random() * 3)],
  active: Math.random() > 0.2,
}))

const ITEMS_PER_PAGE = 10

export function AdminUserManagement() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null);

  interface User {
    id: string;
    role: string;
    active: boolean;
  }

  const handleRoleChange = (userId: number, newRole: any) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ))
    setEditingUser(null)
  }

  const handleActiveToggle = (userId: number, active: boolean) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, active: !user.active } : user
    ))
    setEditingUser(null)
  }

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedUsers = users
    .filter(user => 
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "all" || user.role === roleFilter)
    )
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a];
      const bValue = b[sortColumn as keyof typeof b];
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    })

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const roleColors = {
    student: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    prof: "bg-green-100 text-green-800 hover:bg-green-200",
    admin: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="prof">Professor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" onClick={() => handleSort("name")} className="font-bold">
                      Name {sortColumn === "name" && (sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4 inline" /> : <ChevronDown className="ml-2 h-4 w-4 inline" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("email")} className="font-bold">
                      Email {sortColumn === "email" && (sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4 inline" /> : <ChevronDown className="ml-2 h-4 w-4 inline" />)}
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${roleColors[user.role as keyof typeof roleColors]} transition-colors duration-200`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "default" : "secondary"} className="transition-colors duration-200">
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingUser({...user, id: user.id.toString()})} className="transition-colors duration-200">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit User: {user.name}</DialogTitle>
                            <DialogDescription>
                              Make changes to the users role and status here.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="role" className="text-right">
                                Role
                              </label>
                              <Select
                                value={editingUser?.role || user.role}
                                onValueChange={(value) => setEditingUser(prev => prev ? {...prev, role: value} : null)}
                              >
                                <SelectTrigger className="w-[180px] col-span-3">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="prof">Professor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="status" className="text-right">
                                Status
                              </label>
                              <Switch
                                id="status"
                                checked={editingUser?.active ?? user.active}
                                onCheckedChange={(checked) => setEditingUser((prev) => prev ? {...prev, active: checked} : null)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                              Cancel
                            </Button>
                            <Button onClick={() => {
                              if (editingUser) {
                                handleRoleChange(user.id, editingUser!.role)
                                handleActiveToggle(user.id, editingUser!.active)
                              }
                              setEditingUser(null)
                            }}>
                              Save changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}