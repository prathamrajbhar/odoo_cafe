"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserList from "@/components/admin/UserList";
import { SkeletonTable } from "@/components/shared/Loading";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res: any = await api.get("/users");
      setUsers(res.data?.users ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (isLoading) return <SkeletonTable rows={5} cols={5} />;

  return <UserList users={users} onRefresh={fetchUsers} />;
}
