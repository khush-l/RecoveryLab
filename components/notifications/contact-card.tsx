"use client";

import { useState } from "react";
import type { FamilyContact } from "@/types/notifications";
import { Phone, Mail, Pencil, Trash2, Building2, Award } from "lucide-react";

interface ContactCardProps {
  contact: FamilyContact;
  onEdit: (contact: FamilyContact) => void;
  onDelete: (contactId: string) => void;
  onToggleNotification: (
    contactId: string,
    field: keyof FamilyContact["notifications"],
    value: boolean
  ) => void;
  onToggleChannel: (
    contactId: string,
    field: keyof FamilyContact["channels"],
    value: boolean
  ) => void;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-xs text-[rgba(32,32,32,0.65)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-[#1DB3FB]" : "bg-[rgba(32,32,32,0.15)]"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </label>
  );
}

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleNotification,
  onToggleChannel,
}: ContactCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove ${contact.name} from your contacts?`)) return;
    setDeleting(true);
    onDelete(contact.id);
  };

  return (
    <div className="rounded-2xl border border-[rgba(32,32,32,0.06)] bg-white p-5 shadow-[0px_2px_8px_-2px_rgba(1,65,99,0.08)]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[#202020]">{contact.name}</p>
          <p className="text-xs text-[rgba(32,32,32,0.5)]">
            {contact.relationship}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-block rounded-full bg-[#E0F5FF] px-2 py-0.5 text-[10px] font-semibold text-[#1DB3FB]">
              {contact.role.replace('_', ' ').toUpperCase()}
            </span>
            {contact.preferences?.data_access_level === "full_medical" && (
              <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                FULL ACCESS
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="rounded-lg p-1.5 text-[rgba(32,32,32,0.4)] transition-colors hover:bg-gray-100 hover:text-[#202020]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-1.5 text-[rgba(32,32,32,0.4)] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="mb-4 space-y-1.5">
        {contact.phone && (
          <div className="flex items-center gap-2 text-xs text-[rgba(32,32,32,0.6)]">
            <Phone className="h-3 w-3" />
            {contact.phone}
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-[rgba(32,32,32,0.6)]">
            <Mail className="h-3 w-3" />
            {contact.email}
          </div>
        )}
        {contact.organization && (
          <div className="flex items-center gap-2 text-xs text-[rgba(32,32,32,0.6)]">
            <Building2 className="h-3 w-3" />
            {contact.organization}
          </div>
        )}
        {contact.license_number && (
          <div className="flex items-center gap-2 text-xs text-[rgba(32,32,32,0.6)]">
            <Award className="h-3 w-3" />
            License: {contact.license_number}
          </div>
        )}
      </div>

      {/* Channels */}
      <div className="mb-3 border-t border-[rgba(32,32,32,0.06)] pt-3">
        <p className="mb-2 text-xs font-semibold text-[#202020]">Channels</p>
        <div className="space-y-2">
          {contact.phone && (
            <Toggle
              checked={contact.channels.sms}
              onChange={(v) => onToggleChannel(contact.id, "sms", v)}
              label="SMS"
            />
          )}
          {contact.email && (
            <Toggle
              checked={contact.channels.email}
              onChange={(v) => onToggleChannel(contact.id, "email", v)}
              label="Email"
            />
          )}
        </div>
      </div>

      {/* Notification types */}
      <div className="border-t border-[rgba(32,32,32,0.06)] pt-3">
        <p className="mb-2 text-xs font-semibold text-[#202020]">Notify for</p>
        <div className="space-y-2">
          {contact.notifications.analysis_update !== undefined && (
            <Toggle
              checked={contact.notifications.analysis_update}
              onChange={(v) =>
                onToggleNotification(contact.id, "analysis_update", v)
              }
              label="New analysis"
            />
          )}
          {contact.notifications.weekly_summary !== undefined && (
            <Toggle
              checked={contact.notifications.weekly_summary}
              onChange={(v) =>
                onToggleNotification(contact.id, "weekly_summary", v)
              }
              label="Weekly summary"
            />
          )}
          {contact.notifications.doctor_flag !== undefined && (
            <Toggle
              checked={contact.notifications.doctor_flag}
              onChange={(v) =>
                onToggleNotification(contact.id, "doctor_flag", v)
              }
              label="Health alerts"
            />
          )}
          {contact.notifications.progress_milestone !== undefined && (
            <Toggle
              checked={contact.notifications.progress_milestone}
              onChange={(v) =>
                onToggleNotification(contact.id, "progress_milestone", v)
              }
              label="Milestones"
            />
          )}
          {contact.notifications.medical_report !== undefined && (
            <Toggle
              checked={contact.notifications.medical_report}
              onChange={(v) =>
                onToggleNotification(contact.id, "medical_report", v)
              }
              label="Medical reports"
            />
          )}
          {contact.notifications.insurance_update !== undefined && (
            <Toggle
              checked={contact.notifications.insurance_update}
              onChange={(v) =>
                onToggleNotification(contact.id, "insurance_update", v)
              }
              label="Insurance"
            />
          )}
        </div>
        {contact.preferences?.frequency && (
          <p className="mt-3 text-[10px] text-[rgba(32,32,32,0.4)]">
            Frequency: {contact.preferences.frequency.replace('_', ' ')}
          </p>
        )}
      </div>
    </div>
  );
}
