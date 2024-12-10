import React, { useEffect, useState } from "react";
import "./Calendar.css";
import { db } from "./firebaseConfig"; // Import Firestore
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"; // Firestore functions

interface Event {
  eventId: string;
  date: string;
  title: string;
  description: string;
}

function Calendar() {
  const colelctionRef = collection(db, "calendars");
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error message
  const maxYear = currentYear + 1; // Define the maximum year limit
  const minYear = currentYear; // Define the minimum year limit
  const [loading, setLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(colelctionRef);
        const eventsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          eventId: doc.id, // Use Firestore document ID as eventId
        })) as Event[];
        setEvents(eventsData); // Update events state with fetched data
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };

    fetchEvents();
  }, []);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Thai public holidays with names
  const holidays = {
    [`${currentYear}-01-01`]: "New Year's Day",
    [`${currentYear}-04-06`]: "Chakri Memorial Day",
    [`${currentYear}-04-13`]: "Songkran Festival",
    [`${currentYear}-04-14`]: "Songkran Festival",
    [`${currentYear}-04-15`]: "Songkran Festival",
    [`${currentYear}-05-01`]: "National Labour Day",
    [`${currentYear}-05-04`]: "Coronation Day",
    [`${currentYear}-07-28`]: "King's Birthday",
    [`${currentYear}-08-12`]: "Queen Mother's Birthday",
    [`${currentYear}-10-23`]: "Chulalongkorn Day",
    [`${currentYear}-12-05`]: "King Bhumibol Memorial Day",
    [`${currentYear}-12-10`]: "Constitution Day",
    [`${currentYear}-12-31`]: "New Year's Eve",
    // Note: Makha Bucha, Visakha Bucha, and Royal Ploughing Ceremony are based on lunar calendar
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.target.value, 10));
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(event.target.value, 10));
  };

  const handleAddEvent = async () => {
    if (selectedDate && eventTitle && eventDescription) {
      setLoading(true); // Start loading
      try {
        const newEvent = {
          eventId: Date.now().toString(),
          date: selectedDate,
          title: eventTitle,
          description: eventDescription,
        };
        await addDoc(colelctionRef, newEvent);
        setEvents([...events, newEvent]);
        handleCancel();
      } catch (error) {
        setError("Failed to add event. Please try again.");
      } finally {
        setLoading(false); // End loading
      }
    } else {
      setError("Please fill in all fields.");
    }
  };

  const handleCancel = () => {
    setEventTitle("");
    setEventDescription("");
    setSelectedDate(null);
    setShowPopup(false);
  };

  const handleErrorClose = () => {
    setError(null); // Clear error message
  };

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true); // Start loading
    try {
      const eventDocRef = doc(db, "calendars", eventId);
      await deleteDoc(eventDocRef);
      setEvents(events.filter((event) => event.eventId !== eventId));
    } catch (error) {
      console.error("Error deleting event: ", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const renderDays = () => {
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Adjust to start from Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Previous month's days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {prevMonthDays - i}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const holidayName = holidays[date];
      const dayEvents = events.filter((event) => event.date === date);

      days.push(
        <div
          key={day}
          className={`calendar-day ${holidayName ? "holiday" : ""}`}
          onClick={() => {
            setSelectedDate(date);
            setShowPopup(true);
          }}
        >
          {day}
          {holidayName && <div className="calendar-event">{holidayName}</div>}
          {dayEvents.map((event) => (
            <div key={event.eventId} className="calendar-event">
              {event.title}: {event.description}
              {!holidayName && (
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.eventId);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Next month's days
    const totalDays = firstDayOfMonth + daysInMonth;
    const nextMonthDays = 7 - (totalDays % 7);
    if (nextMonthDays < 7) {
      for (let i = 1; i <= nextMonthDays; i++) {
        days.push(
          <div key={`next-${i}`} className="calendar-day other-month">
            {i}
          </div>
        );
      }
    }

    return days;
  };

  return (
    <div className="calendar">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="calendar-controls">
        <div className="navigation-buttons">
          <button
            onClick={handlePrevMonth}
            className="icon-button"
            disabled={year === minYear && month === 0}
          >
            {"<"}
          </button>
          <button
            onClick={handleNextMonth}
            className="icon-button"
            disabled={year === maxYear && month === 11}
          >
            {">"}
          </button>
        </div>
        <select value={month} onChange={handleMonthChange}>
          {months.map((monthName, index) => (
            <option key={index} value={index}>
              {monthName}
            </option>
          ))}
        </select>
        <select value={year} onChange={handleYearChange}>
          {[minYear, maxYear].map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>
      <div className="calendar-grid">
        <div className="calendar-header">Monday</div>
        <div className="calendar-header">Tuesday</div>
        <div className="calendar-header">Wednesday</div>
        <div className="calendar-header">Thursday</div>
        <div className="calendar-header">Friday</div>
        <div className="calendar-header">Saturday</div>
        <div className="calendar-header">Sunday</div>
        {renderDays()}
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Event</h3>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title"
            />
            <input
              type="text"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Event description"
            />
            <button 
              onClick={handleAddEvent} 
              disabled={!eventTitle || !eventDescription}
            >
              Save
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
      {error && (
        <div className="popup">
          <div className="popup-content">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={handleErrorClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
