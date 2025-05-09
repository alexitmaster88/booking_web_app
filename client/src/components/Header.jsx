import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const {user} = useContext(UserContext);

  // Function to get the first letter of the user's name
  const getFirstLetter = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "";
  };

  return (
    <header className="flex justify-between items-center px-14">
      <Link to={"/"} className="logo flex items-center gap-1 text-primary">
        <span className="font-bold text-xl">ConferenceHub</span>
      </Link>
      
      <div className="search flex border border-gray-300 rounded-full py-2 px-4 gap-2 shadow-md shadow-gray-200">
        <div className="pt-0.5">Anywhere</div>
        <div className="border-l border-gray-300"></div>
        <div className="pt-0.5">Any week</div>
        <div className="border-l border-gray-300"></div>
        <div className="pt-0.5">Add guests</div>
        <button className="bg-primary text-white rounded-full p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>
      
      <Link
        to={user ? "/account" : "/login"}
        className="profile items-center flex border border-gray-300 rounded-full py-2 px-4 gap-2"
      >
        {!user ? (
          <div className="user">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#717171ff"
              className="w-7 h-7"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          <>
            <div className="bg-rose-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
              {getFirstLetter()}
            </div>
          </>
        )}
      </Link>
    </header>
  );
}
