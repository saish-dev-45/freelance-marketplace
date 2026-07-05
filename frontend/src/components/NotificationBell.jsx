import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/ClientDashboard.css";

const API_BASE_URL = "http://localhost:9092";

function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    let eventSource;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/notifications`, {
          withCredentials: true,
        });

        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    fetchNotifications();

    eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`, {
      withCredentials: true,
    });

    eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data);
      setNotifications((currentNotifications) => [
        notification,
        ...currentNotifications.filter((item) => item.id !== notification.id),
      ]);
      setOpen(true);
    });

    eventSource.onerror = (error) => {
      console.error("Notification stream error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = async (notification) => {
    if (!notification.read) {
      try {
        await axios.put(
          `${API_BASE_URL}/notifications/${notification.id}/read`,
          {},
          {
            withCredentials: true,
          },
        );

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (notification.projectId) {
      navigate(`/freelancer/applied-jobs`);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        {
          withCredentials: true,
        },
      );

      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div className="notification-wrapper">
      <button className="notification-button" onClick={() => setOpen((currentOpen) => !currentOpen)}>
        <span>Notifications</span>
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="notification-read-all" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.read ? "" : "unread"}`}
                  onClick={() => markAsRead(notification)}
                >
                  <span>{notification.message}</span>
                  <small>
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now"}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
