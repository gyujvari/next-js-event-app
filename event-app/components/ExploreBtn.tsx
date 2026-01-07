"use client";

import Image from "next/image";

const ExploreBtn = () => {
  return (
    <button
      type="button"
      className="mt-7 mx-auto"
      onClick={() => console.log("click")}
      id="explore-btn"
    >
      <a href="events">Explore events</a>
      <Image
        src="/icons/arrow-down.svg"
        alt="arrow-down"
        width={24}
        height={24}
      ></Image>
    </button>
  );
};

export default ExploreBtn;
