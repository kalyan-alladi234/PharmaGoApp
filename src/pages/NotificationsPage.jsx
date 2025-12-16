import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeUserNotifications, markNotificationRead, deleteNotification } from "../services/notificationService";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserNotifications(user.uid, (items) => setNotes(items));
    return () => unsub && unsub();
  }, [user]);

  if (!user) return <p>Please login to view notifications.</p>;

  if (notes.length === 0) return <p>No notifications.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n.id} className={`border p-3 rounded ${n.read ? "bg-gray-50" : "bg-white"}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.body}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.read && <button className="btn-browse" onClick={() => markNotificationRead(n.id)}>Mark read</button>}
                <button className="btn-remove" onClick={() => deleteNotification(n.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
