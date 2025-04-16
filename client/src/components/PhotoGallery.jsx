import { useState } from "react";

export default function PhotoGallery({placeDetail}) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (showAllPhotos) {
    return (
      // take the whole screen, absolute: make the screen scrollable
      <div className="bg-black fixed inset-0 min-h-screen z-50">
        <div className="bg-black p-4 md:p-8 grid gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl md:text-2xl">
              Photos of {placeDetail.title}
            </h2>
            <button
              onClick={() => setShowAllPhotos(false)}
              className="flex cursor-pointer gap-1 py-1 px-2 items-center rounded-xl bg-white"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close photos
            </button>
          </div>
          <div className="grid gap-4">
            {placeDetail.photos?.length > 0 &&
              placeDetail.photos.map((photo) => (
                <div key={photo} className="flex justify-center">
                  <img 
                    src={"http://localhost:4000/uploads/" + photo} 
                    alt="" 
                    className="max-w-full md:max-w-3xl" 
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Main photo layout */}
      {placeDetail.photos?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {/* First image - always larger on all devices */}
          <div className="col-span-1 sm:col-span-2 row-span-2">
            <img
              onClick={() => setShowAllPhotos(true)}
              className="aspect-square sm:aspect-auto w-full h-full object-cover cursor-pointer rounded-tl-xl md:rounded-bl-xl"
              src={"http://localhost:4000/uploads/" + placeDetail.photos[0]}
              alt={placeDetail.title}
            />
          </div>
          
          {/* Second image - show on mobile and desktop */}
          {placeDetail.photos?.length > 1 && (
            <div className="col-span-1">
              <img
                onClick={() => setShowAllPhotos(true)}
                className="aspect-square object-cover cursor-pointer w-full h-full"
                src={"http://localhost:4000/uploads/" + placeDetail.photos[1]}
                alt=""
              />
            </div>
          )}
          
          {/* Third image - show on mobile and desktop */}
          {placeDetail.photos?.length > 2 && (
            <div className="col-span-1">
              <img
                onClick={() => setShowAllPhotos(true)}
                className="aspect-square object-cover cursor-pointer w-full h-full rounded-tr-xl"
                src={"http://localhost:4000/uploads/" + placeDetail.photos[2]}
                alt=""
              />
            </div>
          )}
          
          {/* Fourth image - show on mobile and desktop */}
          {placeDetail.photos?.length > 3 && (
            <div className="col-span-1">
              <img
                onClick={() => setShowAllPhotos(true)}
                className="aspect-square object-cover cursor-pointer w-full h-full"
                src={"http://localhost:4000/uploads/" + placeDetail.photos[3]}
                alt=""
              />
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gray-200 flex items-center justify-center rounded-xl">
          <span className="text-gray-500">No photos available</span>
        </div>
      )}
      
      {/* Show all photos button */}
      <button
        className="flex gap-1 absolute bottom-2 right-2 py-2 px-4 bg-white shadow-md shadow-gray-500 rounded-lg"
        onClick={() => setShowAllPhotos(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        Show all photos
      </button>
    </div>
  );
}