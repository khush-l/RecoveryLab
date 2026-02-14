"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FamilyContact } from "@/types/notifications";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    notifications: FamilyContact["notifications"];
    channels: FamilyContact["channels"];
  }) => Promise<void>;
  editingContact?: FamilyContact | null;
}

const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Caregiver",
  "Friend",
  "Other",
];

export default function AddContactModal({
  open,
  onClose,
  onSave,
  editingContact,
}: AddContactModalProps) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Spouse");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    analysis_update: true,
    weekly_summary: true,
    doctor_flag: true,
  });
  const [channels, setChannels] = useState({ sms: false, email: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name);
      setRelationship(editingContact.relationship);
      setPhone(editingContact.phone || "");
      setEmail(editingContact.email || "");
      setNotifications({ ...editingContact.notifications });
      setChannels({ ...editingContact.channels });
    } else {
      setName("");
      setRelationship("Spouse");
      setPhone("");
      setEmail("");
      setNotifications({ analysis_update: true, weekly_summary: true, doctor_flag: true });
      setChannels({ sms: false, email: false });
    }
    setError(null);
  }, [editingContact, open]);

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

    // Auto-enable at least one channel
    if (!finalChannels.sms && !finalChannels.email) {
      if (phone.trim()) finalChannels.sms = true;
      else if (email.trim()) finalChannels.email = true;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        email: email.trim(),
        notifications,
        channels: finalChannels,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-[rgba(32,32,32,0.08)] bg-white p-6 shadow-xl">
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
            {editingContact ? "Edit Contact" : "Add Family Contact"}
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
              placeholder="e.g. Jane Smith"
              className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] placeholder:text-[rgba(32,32,32,0.35)] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#202020]">
              Relationship
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2.5 text-sm text-[#202020] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

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

          {/* Notification preferences */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[#202020]">
              Notification preferences
            </p>
            <div className="space-y-2">
              {(
                [
                  ["analysis_update", "New analysis results"],
                  ["weekly_summary", "Weekly recovery summary"],
                  ["doctor_flag", "Doctor flag alerts"],
                ] as const
              ).map(([key, label]) => (
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
    </div>,
    document.body
  );
}
