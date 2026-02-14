"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import ContactCard from "@/components/notifications/contact-card";
import AddContactModal from "@/components/notifications/add-contact-modal";
import type { FamilyContact, NotificationRecord } from "@/types/notifications";
import {
  Bell,
  Plus,
  Users,
  Clock,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function notificationTypeLabel(type: string): string {
  switch (type) {
    case "analysis_update":
      return "Analysis Update";
    case "weekly_summary":
      return "Weekly Summary";
    case "doctor_flag":
      return "Doctor Flag";
    default:
      return type.replace(/_/g, " ");
  }
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [contacts, setContacts] = useState<FamilyContact[]>([]);
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<FamilyContact | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const [contactsRes, historyRes] = await Promise.all([
          fetch(`/api/notifications/contacts?user_id=${user.uid}`),
          fetch(`/api/notifications/history?user_id=${user.uid}`),
        ]);

        const contactsData = await contactsRes.json();
        const historyData = await historyRes.json();

        if (cancelled) return;

        if (contactsData.success) setContacts(contactsData.contacts);
        if (historyData.success) setHistory(historyData.records);
      } catch (err) {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSaveContact = async (contactData: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    notifications: FamilyContact["notifications"];
    channels: FamilyContact["channels"];
  }) => {
    if (!user) return;

    if (editingContact) {
      const res = await fetch(`/api/notifications/contacts/${editingContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? { ...c, ...contactData, updated_at: new Date().toISOString() } : c))
      );
    } else {
      const res = await fetch("/api/notifications/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid, ...contactData }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setContacts((prev) => [data.contact, ...prev]);
    }

    setEditingContact(null);
  };

  const handleDeleteContact = async (contactId: string) => {
    const res = await fetch(`/api/notifications/contacts/${contactId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    }
  };

  const handleToggleNotification = async (
    contactId: string,
    field: keyof FamilyContact["notifications"],
    value: boolean
  ) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    const updatedNotifications = { ...contact.notifications, [field]: value };

    await fetch(`/api/notifications/contacts/${contactId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: updatedNotifications }),
    });

    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, notifications: updatedNotifications } : c
      )
    );
  };

  const handleToggleChannel = async (
    contactId: string,
    field: keyof FamilyContact["channels"],
    value: boolean
  ) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    const updatedChannels = { ...contact.channels, [field]: value };

    await fetch(`/api/notifications/contacts/${contactId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channels: updatedChannels }),
    });

    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, channels: updatedChannels } : c
      )
    );
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1DB3FB] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header solid />

      <main className="flex-1 px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-[1100px]">
          {/* Page header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#202020]">
                Family Notifications
              </h1>
              <p className="mt-1 text-sm text-[rgba(32,32,32,0.6)]">
                Keep your family and caregivers informed about your recovery
                progress.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingContact(null);
                setShowModal(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#202020] bg-gradient-to-b from-[#515151] to-[#202020] px-5 text-sm font-semibold text-white shadow-[0_0_1px_3px_#494949_inset,0_6px_5px_0_rgba(0,0,0,0.55)_inset] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1DB3FB] border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="mb-2 text-lg font-semibold text-red-800">
                Failed to load data
              </p>
              <p className="text-sm text-red-600">{fetchError}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Family Contacts Section */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1DB3FB]" />
                  <h2 className="text-lg font-bold text-[#202020]">
                    Family Contacts
                  </h2>
                </div>

                {contacts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {contacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onEdit={(c) => {
                          setEditingContact(c);
                          setShowModal(true);
                        }}
                        onDelete={handleDeleteContact}
                        onToggleNotification={handleToggleNotification}
                        onToggleChannel={handleToggleChannel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[rgba(32,32,32,0.12)] bg-white/60 px-6 py-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E0F5FF]">
                      <Users className="h-5 w-5 text-[#1DB3FB]" />
                    </div>
                    <p className="text-sm font-semibold text-[#202020]">
                      No contacts yet
                    </p>
                    <p className="mt-1 text-xs text-[rgba(32,32,32,0.5)]">
                      Add family members or caregivers to receive notifications
                      about your recovery progress.
                    </p>
                  </div>
                )}
              </section>

              {/* Notification History Section */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1DB3FB]" />
                  <h2 className="text-lg font-bold text-[#202020]">
                    Notification History
                  </h2>
                </div>

                {history.length > 0 ? (
                  <div className="rounded-2xl border border-[rgba(32,32,32,0.06)] bg-white shadow-[0px_2px_8px_-2px_rgba(1,65,99,0.08)]">
                    <div className="divide-y divide-[rgba(32,32,32,0.06)] px-5">
                      {history.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-start gap-3 py-3"
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              record.status === "sent"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {record.status === "sent" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-[#202020]">
                                {notificationTypeLabel(record.type)}
                              </p>
                              <span className="shrink-0 text-xs text-[rgba(32,32,32,0.45)]">
                                {formatDate(record.created_at)}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs text-[rgba(32,32,32,0.5)]">
                                {record.channel === "sms" ? (
                                  <MessageSquare className="h-3 w-3" />
                                ) : (
                                  <Mail className="h-3 w-3" />
                                )}
                                {record.channel.toUpperCase()} to{" "}
                                {record.contact_name}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-[rgba(32,32,32,0.5)]">
                              {record.message_preview}
                            </p>
                            {record.error && (
                              <p className="mt-0.5 text-xs text-red-500">
                                Error: {record.error}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[rgba(32,32,32,0.1)] bg-white/60 px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-[#202020]">
                      No notifications sent yet
                    </p>
                    <p className="mt-1 text-xs text-[rgba(32,32,32,0.5)]">
                      Notifications will appear here when they are sent to your
                      family contacts.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AddContactModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />
    </div>
  );
}
