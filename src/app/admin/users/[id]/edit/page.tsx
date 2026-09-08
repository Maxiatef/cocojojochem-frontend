'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { Company, UserDetail, UserRole } from '@/lib/types';
import { WEAK_PASSWORD_THRESHOLD, generatePassword, scorePassword } from '@/lib/passwordStrength';
import {
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  SelectField,
  StatCard,
  TextField,
  useToast,
} from '@/components/ui';

// Two-column label-left / control-right rhythm, the way WooCommerce lays out
// its user profile rows. Collapses to stacked on narrow screens.
function FieldRow({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-2 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[200px_1fr] sm:gap-4">
      <div className="pt-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div>
        {children}
        {help && <p className="mt-1.5 text-xs text-slate-500">{help}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="mb-1 text-sm font-semibold text-slate-900">{title}</h2>
      <div>{children}</div>
    </Card>
  );
}

// 4-segment meter. Purely advisory — the real 8-character minimum is
// enforced server-side; this only warns an admin who has typed over the
// generated password with something guessable.
function StrengthMeter({ password }: { password: string }) {
  const { score, label } = scorePassword(password);
  const tone =
    score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-lime-500' : 'bg-green-600';

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-1.5 flex-1 rounded-full ${score >= seg ? tone : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Strength: <span className="font-medium text-slate-700">{label}</span>
      </p>
    </div>
  );
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['admin-user-detail', params.id],
    queryFn: () => api.get<UserDetail>(`/users/${params.id}/detail`),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<Company[]>('/companies'),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [companyId, setCompanyId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // --- Account management state -------------------------------------------
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [confirmWeak, setConfirmWeak] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [sessionsConfirmOpen, setSessionsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Fall back to splitting fullName for any account that predates the
    // first/last columns and somehow wasn't caught by the backfill, so the
    // fields never open blank when a name actually exists.
    const [fallbackFirst, ...fallbackRest] = (user.fullName || '').trim().split(' ');
    setFirstName(user.firstName ?? fallbackFirst ?? '');
    setLastName(user.lastName ?? fallbackRest.join(' '));
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setCompanyId(user.companyId != null ? String(user.companyId) : '');
  }, [user]);

  const composedFullName = useMemo(
    () => [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
    [firstName, lastName],
  );

  const strength = scorePassword(newPassword);
  const isWeak = strength.score < WEAK_PASSWORD_THRESHOLD;

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.patch(`/users/${params.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', params.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User details saved.');
      setFormError(null);
    },
    onError: (err) => setFormError(getFriendlyErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: (body: { newPassword: string }) =>
      api.patch<{ success: boolean; revokedSessions?: number }>(`/users/${params.id}/password`, body),
    onSuccess: (res) => {
      const revoked = res?.revokedSessions ?? 0;
      toast.success(
        revoked > 0
          ? `Password updated. Signed out of ${revoked} active session${revoked === 1 ? '' : 's'}.`
          : 'Password updated.',
      );
      setPasswordError(null);
      setNewPassword('');
      setConfirmWeak(false);
      setPasswordOpen(false);
    },
    onError: (err) => setPasswordError(getFriendlyErrorMessage(err)),
  });

  const resetLinkMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; email: string; emailSent: boolean }>(
        `/users/${params.id}/send-password-reset`,
        {},
      ),
    onSuccess: (res) => {
      setResetConfirmOpen(false);
      // Distinguish "sent" from "created but the mailer is unconfigured" —
      // the backend deliberately doesn't fail the request on a send error,
      // so reporting a flat success here would be misleading.
      if (res?.emailSent) {
        toast.success(`Reset link sent to ${res.email}.`);
      } else {
        toast.error('Reset link created, but the email could not be sent. Check the email configuration.');
      }
    },
    onError: (err) => {
      setResetConfirmOpen(false);
      toast.error(getFriendlyErrorMessage(err));
    },
  });

  const revokeSessionsMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; revokedSessions: number }>(`/users/${params.id}/revoke-sessions`, {}),
    onSuccess: (res) => {
      setSessionsConfirmOpen(false);
      const revoked = res?.revokedSessions ?? 0;
      toast.success(
        revoked > 0
          ? `Signed out of ${revoked} active session${revoked === 1 ? '' : 's'}.`
          : 'No active sessions to sign out.',
      );
    },
    onError: (err) => {
      setSessionsConfirmOpen(false);
      toast.error(getFriendlyErrorMessage(err));
    },
  });

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!composedFullName) {
      setFormError('Enter a first or last name.');
      return;
    }
    saveMutation.mutate({
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      email,
      phone: phone || null,
      role,
      companyId: companyId ? Number(companyId) : null,
    });
  }

  function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (isWeak && !confirmWeak) {
      setPasswordError('This password is weak. Tick the confirmation box to use it anyway.');
      return;
    }
    passwordMutation.mutate({ newPassword });
  }

  function openPasswordEditor() {
    setNewPassword(generatePassword());
    setShowPassword(true);
    setConfirmWeak(false);
    setPasswordError(null);
    setPasswordOpen(true);
  }

  function cancelPasswordEditor() {
    setPasswordOpen(false);
    setNewPassword('');
    setConfirmWeak(false);
    setPasswordError(null);
  }

  return (
    <RequireAdmin>
      <PageHeader title="Edit User" description="Update profile details, role, and account access." />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load this user." />}

      {user && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              <SectionCard title="Name">
                <FieldRow label="First Name">
                  <TextField label="" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </FieldRow>
                <FieldRow label="Last Name">
                  <TextField label="" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </FieldRow>
                <FieldRow
                  label="Display Name"
                  help="Composed from the first and last name above. This is the name shown on orders, invoices, and shipping labels."
                >
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-600">
                    {composedFullName || <span className="text-slate-400">—</span>}
                  </div>
                </FieldRow>
              </SectionCard>

              <SectionCard title="Contact Info">
                <FieldRow
                  label="Email"
                  help="This is the address the customer signs in with, and where order and password emails are sent."
                >
                  <TextField
                    label=""
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Phone">
                  <TextField label="" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FieldRow>
              </SectionCard>

              <SectionCard title="Account">
                <FieldRow label="Role">
                  <SelectField label="" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="SALES">Sales</option>
                    <option value="ADMIN">Admin</option>
                  </SelectField>
                </FieldRow>
                <FieldRow label="Company" help="Links this user to a wholesale account.">
                  <SelectField label="" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                    <option value="">No company</option>
                    {companies?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </SelectField>
                </FieldRow>
                <FieldRow label="Registered">
                  <div className="pt-1.5 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </FieldRow>
              </SectionCard>

              {formError && (
                <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{formError}</div>
              )}

              <div className="flex justify-end">
                <Button type="submit" loading={saveMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>

            <SectionCard title="Account Management">
              {/* --- New password ------------------------------------------ */}
              <FieldRow
                label="New Password"
                help={
                  passwordOpen
                    ? 'Saving this signs the user out of every device.'
                    : 'Set a password directly. The user is not notified by email.'
                }
              >
                {!passwordOpen ? (
                  <Button type="button" variant="secondary" size="sm" onClick={openPasswordEditor}>
                    Set New Password
                  </Button>
                ) : (
                  <form onSubmit={handleSetPassword} className="space-y-3">
                    {/* Input on its own row with the two controls beneath —
                        the column is too narrow to fit them inline without
                        one of them wrapping unpredictably. */}
                    <TextField
                      label=""
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setConfirmWeak(false);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setNewPassword(generatePassword());
                          setShowPassword(true);
                          setConfirmWeak(false);
                        }}
                      >
                        Regenerate
                      </Button>
                    </div>

                    <StrengthMeter password={newPassword} />

                    {isWeak && newPassword.length > 0 && (
                      <label className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                        <input
                          type="checkbox"
                          checked={confirmWeak}
                          onChange={(e) => setConfirmWeak(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600"
                        />
                        <span>Confirm use of weak password</span>
                      </label>
                    )}

                    {passwordError && (
                      <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{passwordError}</div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        loading={passwordMutation.isPending}
                        disabled={newPassword.length < 8 || (isWeak && !confirmWeak)}
                      >
                        Save Password
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={cancelPasswordEditor}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </FieldRow>

              {/* --- Reset link ------------------------------------------- */}
              <FieldRow
                label="Send Password Reset"
                help={`Emails ${user.email} a link to choose their own password. The link expires in 24 hours and can only be used once.`}
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={resetLinkMutation.isPending}
                  onClick={() => setResetConfirmOpen(true)}
                >
                  Send Reset Link
                </Button>
              </FieldRow>

              {/* --- Sessions --------------------------------------------- */}
              <FieldRow
                label="Sessions"
                help="Signs this user out on every device without changing their password. Useful if they've lost a device or left it signed in somewhere."
              >
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={revokeSessionsMutation.isPending}
                  onClick={() => setSessionsConfirmOpen(true)}
                >
                  Log Out Everywhere
                </Button>
              </FieldRow>
            </SectionCard>
          </div>

          <div className="space-y-4">
            <StatCard label="Orders" value={user.orderCount} />
            <StatCard label="Total Spent" value={`$${user.totalSpent.toFixed(2)}`} accent="amber" />
            <StatCard
              label="Last Order"
              value={user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : '—'}
              accent="slate"
            />
          </div>
        </div>
      )}

      {/* Both of these reach outside the admin — one mails a real customer,
          the other kicks them off their devices — so neither fires on a
          single stray click. */}
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Send password reset link?"
        message={`This emails ${user?.email ?? 'this user'} a link to set a new password. Their current password keeps working until they use it.`}
        confirmLabel="Send Link"
        danger={false}
        loading={resetLinkMutation.isPending}
        onConfirm={() => resetLinkMutation.mutate()}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <ConfirmDialog
        open={sessionsConfirmOpen}
        title="Log out everywhere?"
        message="This user will be signed out on every device and will need to sign in again. Their password is not changed."
        confirmLabel="Log Out Everywhere"
        loading={revokeSessionsMutation.isPending}
        onConfirm={() => revokeSessionsMutation.mutate()}
        onCancel={() => setSessionsConfirmOpen(false)}
      />
    </RequireAdmin>
  );
}
