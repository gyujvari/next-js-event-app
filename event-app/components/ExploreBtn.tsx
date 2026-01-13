"use client";

import Image from "next/image";
import posthog from "posthog-js";

const ExploreBtn = () => {
  const handleExploreClick = () => {
    posthog.capture("explore_events_clicked", {
      button_id: "explore-btn",
      destination: "events",
    });
  };

  return (
    <button
      type="button"
      className="mt-7 mx-auto"
      onClick={handleExploreClick}
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
