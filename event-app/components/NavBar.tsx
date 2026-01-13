"use client";

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const NavBar = () => {
  const handleLogoClick = () => {
    posthog.capture("logo_clicked", {
      navigation_target: "/",
    });
  };

  const handleNavHomeClick = () => {
    posthog.capture("nav_home_clicked", {
      navigation_target: "/",
    });
  };

  const handleNavEventsClick = () => {
    posthog.capture("nav_events_clicked", {
      navigation_target: "/",
    });
  };

  const handleNavCreateEventClick = () => {
    posthog.capture("nav_create_event_clicked", {
      navigation_target: "/",
    });
  };

  return (
    <header>
      <nav>
        <Link href="/" className="logo" onClick={handleLogoClick}>
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>Dev event</p>
        </Link>
        <ul>
          <Link href="/" onClick={handleNavHomeClick}>Home</Link>
          <Link href="/" onClick={handleNavEventsClick}>Events</Link>
          <Link href="/" onClick={handleNavCreateEventClick}>Create event</Link>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
