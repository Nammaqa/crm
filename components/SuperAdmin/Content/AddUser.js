'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';

const roles = ['ADMIN', 'RECRUITER', 'SALES', 'ACCOUNT_MANAGER'];

export default function SignupForm() {
  const [form, setForm] = useState({
    userName: '',
    wbEmailId: '',
    password: '',
    phoneNumber: '',
    role: 'SALES',
  });

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'User created!');
        setForm({
          userName: '',
          wbEmailId: '',
          password: '',
          phoneNumber: '',
          role: 'SALES',
        });
        fetchUsers(); // refresh list
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch {
      toast.error('Network error!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="border p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-center">Create User</h2>

        <div>
          <Label htmlFor="userName">Username</Label>
          <Input name="userName" value={form.userName} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="wbEmailId">Email</Label>
          <Input name="wbEmailId" value={form.wbEmailId} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input type="password" name="password" value={form.password} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        </div>

        <div>
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Create User
        </Button>
      </div>

      {/* ✅ User List Section */}
      <div className="mt-8 border p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Registered Users</h2>
        {users.length === 0 ? (
          <p className="text-muted-foreground">No users found.</p>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">Username</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2">{u.userName}</td>
                    <td className="px-4 py-2">{u.wbEmailId}</td>
                    <td className="px-4 py-2">{u.phoneNumber || '-'}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
