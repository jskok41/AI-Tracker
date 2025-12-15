'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useIsAdmin, useUserRole } from '@/lib/hooks/use-permissions';
import { Shield, Users, UserCheck, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER' | 'GUEST';
  department?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  _count: {
    ownedProjects: number;
    projectMemberships: number;
  };
}

interface Project {
  id: string;
  name: string;
  ownerId: string;
  members: {
    userId: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }[];
}

interface SettingsPageClientProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
    role: string | null | undefined;
  };
  users: User[];
  projects: Project[];
  allUsers: {
    id: string;
    email: string;
    name: string;
    role: string | null;
  }[];
}

export function SettingsPageClient({
  currentUser,
  users: initialUsers,
  projects: initialProjects,
  allUsers,
}: SettingsPageClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const isAdmin = useIsAdmin();
  const userRole = useUserRole();

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjectMembers = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const data = await response.json();
        // Update the project in the projects list
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  members: data.map((m: any) => ({
                    userId: m.userId,
                    user: m.user,
                  })),
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER' | 'GUEST') => {
    if (!isAdmin) {
      toast.error('Only admins can change user roles');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? updatedUser : u))
        );
        toast.success(`Role updated to ${newRole}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProjectMembers = async () => {
    if (!selectedProject || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const promises = selectedUsers.map((userId) =>
        fetch(`/api/projects/${selectedProject}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        })
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => !r.ok);

      if (errors.length === 0) {
        toast.success('Members added successfully');
        setSelectedUsers([]);
        setSelectedProject(null);
        await fetchProjectMembers(selectedProject);
      } else {
        const errorData = await errors[0].json();
        toast.error(errorData.error || 'Failed to add some members');
      }
    } catch (error) {
      console.error('Error adding project members:', error);
      toast.error('Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProjectMember = async (projectId: string, userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/members?userId=${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        toast.success('Member removed successfully');
        await fetchProjectMembers(projectId);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing project member:', error);
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'MEMBER':
        return 'secondary';
      case 'GUEST':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  return (
    <div className="space-y-6">
      {/* User Access Control - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>User Access Control</CardTitle>
            </div>
            <CardDescription>
              Manage user roles and permissions. Admins have full access, Members can edit their own projects, and Guests have view-only access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Projects Owned</TableHead>
                    <TableHead>Projects Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user._count.ownedProjects}</TableCell>
                        <TableCell>{user._count.projectMemberships}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value as 'ADMIN' | 'MEMBER' | 'GUEST')
                            }
                            disabled={loading || user.id === currentUser.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                              <SelectItem value="MEMBER">MEMBER</SelectItem>
                              <SelectItem value="GUEST">GUEST</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Member Assignment - For Project Owners */}
      {(userRole === 'ADMIN' || userRole === 'MEMBER') && projects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Project Member Assignment</CardTitle>
            </div>
            <CardDescription>
              Assign members to your projects to allow them to edit. Only project owners and admins can assign members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.members.length} member{project.members.length !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project.id);
                          setSelectedUsers([]);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Manage Members
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Manage Members: {project.name}</DialogTitle>
                        <DialogDescription>
                          Assign members to this project to allow them to edit it.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Current Members */}
                        <div>
                          <Label className="mb-2 block">Current Members</Label>
                          {project.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No members assigned</p>
                          ) : (
                            <div className="space-y-2">
                              {project.members.map((member) => (
                                <div
                                  key={member.userId}
                                  className="flex items-center justify-between rounded-md border p-2"
                                >
                                  <div>
                                    <p className="font-medium">{member.user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {member.user.email}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveProjectMember(project.id, member.userId)
                                    }
                                    disabled={loading}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Add Members */}
                        <div>
                          <Label className="mb-2 block">Add Members</Label>
                          <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-2">
                            {allUsers
                              .filter(
                                (user) =>
                                  user.id !== project.ownerId &&
                                  !project.members.some((m) => m.userId === user.id)
                              )
                              .map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted"
                                >
                                  <Checkbox
                                    checked={selectedUsers.includes(user.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedUsers([...selectedUsers, user.id]);
                                      } else {
                                        setSelectedUsers(
                                          selectedUsers.filter((id) => id !== user.id)
                                        );
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                  <Badge variant="outline">{user.role || 'GUEST'}</Badge>
                                </div>
                              ))}
                          </div>
                          {allUsers.filter(
                            (user) =>
                              user.id !== project.ownerId &&
                              !project.members.some((m) => m.userId === user.id)
                          ).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              All users are already members of this project
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(null);
                              setSelectedUsers([]);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              await handleAddProjectMembers();
                              await fetchProjectMembers(project.id);
                            }}
                            disabled={loading || selectedUsers.length === 0}
                          >
                            Add Selected Members
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info for non-admin users */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Your Access Level</CardTitle>
            <CardDescription>
              Your current role: <Badge variant={getRoleBadgeVariant(userRole || 'GUEST')}>
                {userRole || 'GUEST'}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {userRole === 'GUEST' && (
                <p className="text-muted-foreground">
                  You have view-only access. Contact an administrator to request edit permissions.
                </p>
              )}
              {userRole === 'MEMBER' && (
                <p className="text-muted-foreground">
                  You can edit and create projects. You can assign members to projects you own.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

