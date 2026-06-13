"use client";

import React, { useState } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

type Role = "ADMIN" | "EMPLOYEE";
type Status = "ACTIVE" | "DISABLED";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
}

interface Props {
  users: User[];
  onRefresh: () => void;
}

const EMPTY_FORM = { name: "", email: "", password: "", role: "EMPLOYEE" as Role, status: "ACTIVE" as Status };

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-surface-container-high text-on-surface-variant",
];

export const UserList: React.FC<Props> = ({ users, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");

  const [userModal, setUserModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [pwModal, setPwModal] = useState(false);
  const [pwTarget, setPwTarget] = useState<User | null>(null);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setUserModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, status: u.status });
    setUserModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email are required"); return; }
    if (!editing && !form.password) { toast.error("Password is required for new users"); return; }

    setSaving(true);
    const payload: Record<string, any> = { name: form.name, email: form.email, role: form.role, status: form.status };
    if (!editing) payload.password = form.password;

    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/users", payload);
        toast.success("User created");
      }
      setUserModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const openPassword = (u: User) => {
    setPwTarget(u);
    setNewPw("");
    setConfirmPw("");
    setShowPw(false);
    setPwModal(true);
  };

  const handleChangePassword = async () => {
    if (!newPw) { toast.error("Password is required"); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    if (!pwTarget) return;

    setSavingPw(true);
    try {
      await api.put(`/users/${pwTarget.id}/password`, { password: newPw });
      toast.success("Password updated");
      setPwModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    setDeletingId(u.id);
    try {
      await api.delete(`/users/${u.id}`);
      toast.success("User deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const set = (k: keyof typeof EMPTY_FORM, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5 mb-6">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">User Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Manage employee access, roles, and security credentials.</p>
        </div>
        <Button
          variant="primary"
          onClick={openNew}
          leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          New User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-available-border rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ADMIN", "EMPLOYEE"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-full text-label-md transition-colors border ${
                roleFilter === r
                  ? "bg-primary-container text-on-primary-container border-primary/30"
                  : "bg-surface text-on-surface-variant border-available-border hover:bg-surface-container"
              }`}
            >
              {r === "ALL" ? "All Roles" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-surface-container-low border-b border-available-border sticky top-0">
              <tr>
                <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide w-12" />
                <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">User</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Role</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/75 italic">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => {
                  const avatarClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-md font-bold ${avatarClass}`}>
                          {getInitials(u.name)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-label-lg text-on-surface">{u.name}</div>
                        <div className="text-body-sm text-on-surface-variant">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-label-md border ${
                            u.role === "ADMIN"
                              ? "bg-surface-container-highest border-outline-variant text-on-surface"
                              : "bg-surface border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md ${
                            u.status === "ACTIVE"
                              ? "bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]"
                              : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-success" : "bg-outline"}`} />
                          {u.status.charAt(0) + u.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openPassword(u)}
                            className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition-colors"
                            title="Change Password"
                          >
                            <span className="material-symbols-outlined text-[20px]">key</span>
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u.id}
                            className="p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-danger rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-available-border px-6 py-3 text-body-sm text-on-surface-variant bg-surface-container-lowest">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {/* New/Edit User Modal */}
      <Modal
        isOpen={userModal}
        onClose={() => setUserModal(false)}
        title={editing ? "Edit User" : "Add New User"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setUserModal(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>
              {editing ? "Save Changes" : "Save User"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.local"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              options={[
                { value: "EMPLOYEE", label: "Employee" },
                { value: "ADMIN", label: "Administrator" },
              ]}
              value={form.role}
              onChange={(e) => set("role", e.target.value as Role)}
            />
            <Select
              label="Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "DISABLED", label: "Disabled" },
              ]}
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}
            />
          </div>
          {!editing && (
            <div className="pt-2 border-t border-available-border">
              <div className="relative">
                <Input
                  label="Initial Password"
                  type={showPw ? "text" : "password"}
                  placeholder="Set a temporary password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-9 text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPw ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1 text-xs">User should change this upon first login.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={pwModal}
        onClose={() => setPwModal(false)}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPwModal(false)} disabled={savingPw}>Cancel</Button>
            <Button variant="primary" onClick={handleChangePassword} isLoading={savingPw}>Update</Button>
          </>
        }
      >
        {pwTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <div>
                <div className="text-label-md font-semibold text-on-surface">{pwTarget.name}</div>
                <div className="text-body-sm text-on-surface-variant">{pwTarget.role.charAt(0) + pwTarget.role.slice(1).toLowerCase()}</div>
              </div>
            </div>
            <div className="relative">
              <Input
                label="New Password"
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-9 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPw ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default UserList;
