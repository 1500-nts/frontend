import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, UserPlus, X } from "lucide-react";
import { createUser, getAllUsers } from "../api/auth";
import type { AdminCreateUserRequest, Role, UserResponse } from "../types";
import { Button, Card, Field, Input, PageHeader, Select } from "../components/ui";
import { formatDate, getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

const emptyForm: AdminCreateUserRequest = { name: "", email: "", password: "", role: "USER" };

export function AdminsPage() {
  const { notify } = useToast();
  const [users, setUsers] = useState<UserResponse[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdminCreateUserRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    getAllUsers()
      .then(setUsers)
      .catch((err) => notify("error", getErrorMessage(err)));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof AdminCreateUserRequest>(key: K, value: AdminCreateUserRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createUser(form);
      notify(
        "success",
        created.role === "ADMIN"
          ? `${created.name} now has full admin access.`
          : `${created.name} created — open an account for them from Accounts.`
      );
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin access"
        title="People with an account in the system"
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} /> : <UserPlus size={16} />}
            {showForm ? "Close" : "Create user"}
          </Button>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-sm text-slate-600 -mt-1">
              A new <strong>ADMIN</strong> gets identical privileges to you — full access to every
              account and transaction. A new <strong>USER</strong> is just a record; open their bank
              account afterwards from the Accounts tab.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name" htmlFor="name">
                <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
              </Field>
              <Field label="Role" htmlFor="role">
                <Select id="role" value={form.role} onChange={(e) => update("role", e.target.value as Role)}>
                  <option value="USER">User (account holder)</option>
                  <option value="ADMIN">Admin (full access)</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" htmlFor="newEmail">
                <Input
                  id="newEmail"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field label="Temporary password" htmlFor="newPassword" hint="At least 6 characters.">
                <Input
                  id="newPassword"
                  type="password"
                  minLength={6}
                  required
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {users === null ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-paper-200">
                  <td className="px-5 py-3 text-ink-900">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 text-brass-600 font-medium">
                        <ShieldCheck size={14} /> Admin
                      </span>
                    ) : (
                      <span className="text-slate-600">User</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.enabled ? "Enabled" : "Disabled"}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
