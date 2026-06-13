"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePOS } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import Modal from "@/components/shared/Modal";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: CustomerForm = { name: "", email: "", phone: "" };

export const CustomerPanel: React.FC = () => {
  const { activeModal, setActiveModal, setCustomer, customerId } = usePOS();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // null = list view, "new" = new form, string id = edit form
  const [formMode, setFormMode] = useState<null | "new" | string>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = activeModal === "customer";

  const fetchCustomers = useCallback((q = "") => {
    setLoading(true);
    const qs = q.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
    api.get<{ data: { customers: Customer[] } }>(`/customers${qs}`)
      .then((res) => setCustomers(res.data.customers))
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isOpen) fetchCustomers();
  }, [isOpen, fetchCustomers]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchCustomers(val), 350);
  };

  const openEdit = (c: Customer) => {
    setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "" });
    setFormMode(c.id);
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormMode("new");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (formMode === "new") {
        const res = await api.post<{ data: { customer: Customer } }>("/customers", {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        });
        setCustomers((prev) => [res.data.customer, ...prev]);
        toast.success("Customer created");
      } else if (formMode) {
        const res = await api.put<{ data: { customer: Customer } }>(`/customers/${formMode}`, {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        });
        setCustomers((prev) => prev.map((c) => c.id === formMode ? res.data.customer : c));
        toast.success("Customer updated");
      }
      setFormMode(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Customer) => {
    try {
      await api.delete(`/customers/${c.id}`);
      setCustomers((prev) => prev.filter((x) => x.id !== c.id));
      if (customerId === c.id) setCustomer(null, null);
      toast.success("Customer deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleSelect = (c: Customer) => {
    setCustomer(c.id, c.name);
    setActiveModal(null);
    toast.success(`${c.name} linked to order`);
  };

  const handleRemoveCustomer = () => {
    setCustomer(null, null);
    setActiveModal(null);
    toast.info("Customer removed from order");
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setActiveModal(null)} title="Customers" size="lg">
      {formMode !== null ? (
        /* ── Create / Edit form ── */
        <div className="space-y-4">
          <p className="text-label-md font-semibold text-on-surface">
            {formMode === "new" ? "New Customer" : "Edit Customer"}
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-1 block">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Customer name"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="customer@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-1 block">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 00000 00000"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setFormMode(null)}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold text-label-md hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving
                ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                : <span className="material-symbols-outlined text-[18px]">save</span>
              }
              Save
            </button>
          </div>
        </div>
      ) : (
        /* ── List view ── */
        <div className="space-y-4">
          {/* Search + New */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              New
            </button>
          </div>

          {/* Remove current customer */}
          {customerId && (
            <button
              onClick={handleRemoveCustomer}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-error/40 text-error text-label-sm hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">person_remove</span>
              Remove customer from this order
            </button>
          )}

          {/* Customer list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px]">person_search</span>
              <p className="text-body-md">{search ? "No customers found" : "No customers yet"}</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant border border-outline-variant rounded-xl overflow-hidden">
              {customers.map((c) => {
                const isSelected = customerId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isSelected ? "bg-primary-container/20" : "hover:bg-surface-container-low"
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container font-bold text-label-md"
                    >
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md font-semibold text-on-surface truncate">{c.name}</p>
                      <p className="text-body-sm text-on-surface-variant truncate">
                        {[c.email, c.phone].filter(Boolean).join(" · ") || "No contact info"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleSelect(c)}
                        title="Select customer"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSelected
                            ? "text-primary"
                            : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isSelected ? "check_circle" : "add_circle"}
                        </span>
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CustomerPanel;
