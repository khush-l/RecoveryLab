import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FamilyContact, ContactRole } from "@/types/notifications";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: {
    name: string;
    relationship: string;
    role: ContactRole;
    phone: string;
    email: string;
    organization?: string;
    license_number?: string;
    notifications: FamilyContact["notifications"];
    channels: FamilyContact["channels"];
    preferences: FamilyContact["preferences"];
  }) => Promise<void>;
  editingContact?: FamilyContact | null;
}

const CONTACT_ROLES: { value: ContactRole; label: string; relationships: string[] }[] = [
  { 
    value: "family", 
    label: "Family Member", 
    relationships: ["Spouse", "Parent", "Child", "Sibling", "Partner", "Relative"] 
  },
  { 
    value: "doctor", 
    label: "Doctor / Physician", 
    relationships: ["Primary Care", "Orthopedic Surgeon", "Sports Medicine", "Neurologist", "Specialist"] 
  },
  { 
    value: "physical_therapist", 
    label: "Physical Therapist", 
    relationships: ["Physical Therapist", "Occupational Therapist", "Athletic Trainer"] 
  },
  { 
    value: "insurance_provider", 
    label: "Insurance Provider", 
    relationships: ["Case Manager", "Claims Adjuster", "Insurance Representative"] 
  },
  { 
    value: "caregiver", 
    label: "Caregiver", 
    relationships: ["Professional Caregiver", "Home Health Aide", "Nurse"] 
  },
  { 
    value: "other", 
    label: "Other", 
    relationships: ["Friend", "Coach", "Other"] 
  },
];

const NOTIFICATION_TYPES = [
  { key: "analysis_update" as const, label: "New analysis results", roles: ["all"] },
  { key: "weekly_summary" as const, label: "Weekly progress summary", roles: ["all"] },
  { key: "doctor_flag" as const, label: "Health concern alerts", roles: ["all"] },
  { key: "progress_milestone" as const, label: "Progress milestones", roles: ["family", "doctor", "physical_therapist", "caregiver"] },
  { key: "exercise_completion" as const, label: "Exercise completion", roles: ["family", "physical_therapist", "caregiver"] },
  { key: "medical_report" as const, label: "Detailed medical reports", roles: ["doctor", "physical_therapist"] },
  { key: "insurance_update" as const, label: "Insurance & billing updates", roles: ["insurance_provider"] },
  { key: "appointment_reminder" as const, label: "Appointment reminders", roles: ["all"] },
];

export default function AddContactModal({
  open,
  onClose,
  onSave,
  editingContact,
}: AddContactModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ContactRole>("family");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [notifications, setNotifications] = useState({
    analysis_update: true,
    weekly_summary: true,
    doctor_flag: true,
    progress_milestone: true,
    exercise_completion: false,
    medical_report: false,
    insurance_update: false,
    appointment_reminder: true,
  });
  const [channels, setChannels] = useState({ sms: false, email: false });
  const [preferences, setPreferences] = useState<FamilyContact["preferences"]>({
    frequency: "realtime" as const,
    data_access_level: "basic" as const,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentRoleConfig = CONTACT_ROLES.find(r => r.value === role);
  const availableRelationships = currentRoleConfig?.relationships || [];

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name);
      setRole(editingContact.role || "family");
      setRelationship(editingContact.relationship);
      setPhone(editingContact.phone || "");
      setEmail(editingContact.email || "");
      setOrganization(editingContact.organization || "");
      setLicenseNumber(editingContact.license_number || "");
      setNotifications({ ...editingContact.notifications });
      setChannels({ ...editingContact.channels });
      setPreferences({ ...editingContact.preferences });
    } else {
      setName("");
      setRole("family");
      setRelationship("");
      setPhone("");
      setEmail("");
      setOrganization("");
      setLicenseNumber("");
      setNotifications({ 
        analysis_update: true, 
        weekly_summary: true, 
        doctor_flag: true,
        progress_milestone: true,
        exercise_completion: false,
        medical_report: false,
        insurance_update: false,
        appointment_reminder: true,
      });
      setChannels({ sms: false, email: false });
      setPreferences({
        frequency: "realtime",
        data_access_level: "basic",
      });
    }
    setError(null);
  }, [editingContact, open]);

  // Update relationship when role changes
  useEffect(() => {
    if (!editingContact) {
      const defaultRelationship = availableRelationships[0] || "";
      setRelationship(defaultRelationship);
    }
  }, [role, editingContact]);

  // Auto-set data access level based on role
  useEffect(() => {
    if (role === "doctor" || role === "physical_therapist") {
      setPreferences(prev => ({ ...prev, data_access_level: "full_medical" }));
    } else if (role === "insurance_provider") {
      setPreferences(prev => ({ ...prev, data_access_level: "detailed" }));
    } else {
      setPreferences(prev => ({ ...prev, data_access_level: "basic" }));
    }
  }, [role]);

  // Auto-enable channel when contact info is added (user can still uncheck)
  useEffect(() => {
    if (phone.trim() && !channels.sms && !editingContact) {
      setChannels(prev => ({ ...prev, sms: true }));
    }
  }, [phone]);

  useEffect(() => {
    if (email.trim() && !channels.email && !editingContact) {
      setChannels(prev => ({ ...prev, email: true }));
    }
  }, [email]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError("At least one of phone or email is required");
      return;
    }

    const finalChannels = {
      sms: phone.trim() ? channels.sms : false,
      email: email.trim() ? channels.email : false,
    };

    // Ensure at least one channel is selected
    if (!finalChannels.sms && !finalChannels.email) {
      setError("Please select at least one contact method (SMS or Email)");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        relationship,
        role,
        phone: phone.trim(),
        email: email.trim(),
        organization: organization.trim() || undefined,
        license_number: licenseNumber.trim() || undefined,
        notifications,
        channels: finalChannels,
        preferences,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 my-8 w-full max-w-lg rounded-2xl border border-[rgba(32,32,32,0.08)] bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[rgba(32,32,32,0.4)] hover:bg-gray-100 hover:text-[#202020]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#E0F5FF] to-white">
            <UserPlus className="h-5 w-5 text-[#1DB3FB]" />
          </div>
          <h3 className="text-lg font-bold text-[#202020]">
            {editingContact ? "Edit Contact" : "Add Care Team Contact"}
          </h3>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] placeholder:text-[rgba(32,32,32,0.35)] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
              Contact Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ContactRole)}
              className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
            >
              {CONTACT_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
              Relationship / Title
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
            >
              {availableRelationships.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Organization (for professionals) */}
          {(role === "doctor" || role === "physical_therapist" || role === "insurance_provider") && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
                Organization / Practice
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={role === "insurance_provider" ? "Insurance Company Name" : "Hospital or Clinic Name"}
                className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] placeholder:text-[rgba(32,32,32,0.35)] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
              />
            </div>
          )}

          {/* License Number (for medical professionals) */}
          {(role === "doctor" || role === "physical_therapist") && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
                License Number (Optional)
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="License #"
                className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] placeholder:text-[rgba(32,32,32,0.35)] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
              />
            </div>
          )}

          {/* Phone + Email side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] placeholder:text-[rgba(32,32,32,0.35)] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] placeholder:text-[rgba(32,32,32,0.35)] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
              />
            </div>
          </div>

          {/* Communication Channels */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[#202020]">
              How should we contact them?
            </p>
            <div className="rounded-lg border border-[rgba(32,32,32,0.15)] bg-[#f8f9fa] p-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels(prev => ({ ...prev, sms: e.target.checked }))}
                  disabled={!phone.trim()}
                  className="h-4 w-4 rounded border-gray-300 text-[#1DB3FB] focus:ring-[#1DB3FB] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#202020]">📱 Text Messages (SMS)</span>
                  <p className="text-xs text-[rgba(32,32,32,0.5)]">
                    {phone.trim() ? `Send to ${phone}` : 'Enter phone number above'}
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels(prev => ({ ...prev, email: e.target.checked }))}
                  disabled={!email.trim()}
                  className="h-4 w-4 rounded border-gray-300 text-[#1DB3FB] focus:ring-[#1DB3FB] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#202020]">📧 Email</span>
                  <p className="text-xs text-[rgba(32,32,32,0.5)]">
                    {email.trim() ? `Send to ${email}` : 'Enter email address above'}
                  </p>
                </div>
              </label>

              {!channels.sms && !channels.email && (phone.trim() || email.trim()) && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Select at least one contact method</span>
                </p>
              )}
            </div>
          </div>

          {/* Notification preferences */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[#202020]">
              What should we notify them about?
            </p>
            <div className="space-y-2">
              {NOTIFICATION_TYPES
                .filter(notif => notif.roles.includes("all") || notif.roles.includes(role))
                .map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-[rgba(32,32,32,0.65)]"
                  >
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#1DB3FB] focus:ring-[#1DB3FB]"
                    />
                    {label}
                  </label>
                ))}
            </div>
          </div>

          {/* Notification frequency */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
              How often should they receive updates?
            </label>
            <select
              value={preferences.frequency}
              onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
              className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
            >
              <option value="realtime">Real-time (immediately as events happen)</option>
              <option value="daily_digest">Daily Digest (once per day summary)</option>
              <option value="weekly_digest">Weekly Digest (once per week summary)</option>
            </select>
            <p className="mt-1 text-xs text-[rgba(32,32,32,0.5)]">
              Note: Critical health alerts are always sent immediately
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant="modern-outline"
            size="modern-lg"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="modern-primary"
            size="modern-lg"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : editingContact ? (
              "Update Contact"
            ) : (
              "Add Contact"
            )}
          </Button>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
}
