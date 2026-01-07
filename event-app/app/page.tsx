import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";

const events = [
  { image: "/images/event1.png", title: "Event 1" },
  { image: "/images/event2.png", title: "Event 2" },
];

const page = () => {
  return (
    <section>
      <h1 className="text-center">Goaldiggers</h1>
      <p className="text-center mt-5">Csocso csocso csocos</p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Featured events</h3>
        <ul className="events">
          {events.map((event) => (
            <EventCard {...event} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
