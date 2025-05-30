import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function BookingWidget({ placeDetail, buttonDisabled }) {
  const [numOfGuests, setNumOfGuests] = useState(1);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [redirect, setRedirect] = useState();
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setGuestName(user.name);
    }

    // Set default dates if available from the conference room
    if (placeDetail?.startDate && !checkInDate) {
      const defaultStart = new Date(placeDetail.startDate);
      setCheckInDate(defaultStart.toISOString().split("T")[0]);
    }

    if (placeDetail?.endDate && !checkOutDate) {
      const defaultEnd = new Date(placeDetail.endDate);
      setCheckOutDate(defaultEnd.toISOString().split("T")[0]);
    }
  }, [user, placeDetail]);

  let hours = 0;

  if (checkInDate && checkOutDate) {
    // Calculate hours for conference room bookings
    hours =
      differenceInCalendarDays(
        new Date(checkOutDate),
        new Date(checkInDate)
      ) * 24; // Simple calculation, can be refined for actual hour usage

    if (hours <= 0) {
      hours = 1; // Minimum booking of 1 hour
    }
  }

  async function handleReserve(event) {
    event.preventDefault();
    setError("");

    // Basic validation
    if (!checkInDate) {
      setError("Please select a check-in date");
      return;
    }
    if (!checkOutDate) {
      setError("Please select a check-out date");
      return;
    }
    if (!guestName) {
      setError("Please provide your name");
      return;
    }
    if (!guestPhone) {
      setError("Please provide your phone number for contact");
      return;
    }

    try {
      // Check if user is logged in
      if (!user) {
        setError("Please log in to book a conference room");
        return;
      }

      // Check if user is not the owner (hosts shouldn't book their own rooms)
      if (user.id === placeDetail.ownerId) {
        setError("You cannot book your own conference room");
        return;
      }

      const totalPrice = placeDetail.price * hours;

      const response = await axios.post("/bookings", {
        place: placeDetail.id,
        checkInDate,
        checkOutDate,
        numOfGuests,
        guestName,
        guestPhone,
        totalPrice,
      });

      setRedirect("/account/bookings");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to make reservation. Please try again."
      );
    }
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  if (!user) {
    return (
      <div className="bg-white p-5 rounded-xl border shadow-md">
        <div className="text-left pb-1">
          <span className="font-bold text-2xl">£{placeDetail.price}</span> per
          hour
        </div>
        <p className="my-4 text-center">
          Please{" "}
          <a href="/login" className="underline text-primary">
            login
          </a>{" "}
          to book this conference room
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => handleReserve(event)}>
      <div className="bg-white p-5 rounded-xl border shadow-md">
        <div className="text-left pb-1">
          <span className="font-bold text-2xl">£{placeDetail.price}</span> per
          hour
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded-lg mb-2 text-sm">
            {error}
          </div>
        )}

        <div className="my-2 border rounded-xl">
          <div className="flex border-b">
            <div className="px-3 py-4 w-1/2">
              <label>Start date: </label>
              <input
                type="date"
                className="cursor-pointer"
                value={checkInDate}
                onChange={(event) => setCheckInDate(event.target.value)}
                min={
                  placeDetail.startDate
                    ? placeDetail.startDate.split("T")[0]
                    : undefined
                }
                max={
                  placeDetail.endDate
                    ? placeDetail.endDate.split("T")[0]
                    : undefined
                }
              />
            </div>
            <div className="px-3 py-4 border-l">
              <label>End date: </label>
              <input
                type="date"
                className="cursor-pointer"
                value={checkOutDate}
                onChange={(event) => setCheckOutDate(event.target.value)}
                min={
                  checkInDate ||
                  (placeDetail.startDate
                    ? placeDetail.startDate.split("T")[0]
                    : undefined)
                }
                max={
                  placeDetail.endDate
                    ? placeDetail.endDate.split("T")[0]
                    : undefined
                }
              />
            </div>
          </div>
          <div className="px-3 py-4 border-b">
            <label>Number of attendees</label>
            <input
              type="number"
              value={numOfGuests}
              onChange={(event) => setNumOfGuests(event.target.value)}
              placeholder="1"
              min="1"
              max={placeDetail.maxGuests}
            />
            {placeDetail.maxGuests && (
              <p className="text-gray-500 text-xs mt-1">
                Maximum capacity: {placeDetail.maxGuests} people
              </p>
            )}
          </div>
          <div className="px-3 py-4">
            <label>Your full name</label>
            <input
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Jane Doe"
            />
            <label>Phone number</label>
            <input
              type="text"
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              placeholder="+44012345678910"
            />
          </div>
          {hours > 0 && (
            <div>
              <div className="border-b border-t">
                <div className="flex px-3 py-4 justify-between items-center text-gray-600">
                  <p className="underline">
                    £{placeDetail.price} x {hours} hours{" "}
                  </p>
                  <p className="">£{placeDetail.price * hours}</p>
                </div>
                <div className="flex px-3 pb-4 justify-between items-center text-gray-600">
                  <p className="underline">Service fee</p>
                  <p className="">£{hours && "20"}</p>
                </div>
              </div>
              <div>
                <div className="flex px-3 py-4 justify-between items-center">
                  <p className="underline">Total</p>
                  <p className="">
                    £{hours && placeDetail.price * hours + 20}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className={buttonDisabled ? "normal" : "primary"}
          disabled={buttonDisabled}
        >
          {buttonDisabled ? "Not available to book" : "Request to Book"}
        </button>
      </div>
    </form>
  );
}
