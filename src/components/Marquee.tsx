import { cn } from "@/lib/utils";
import Marquee from "./ui/marquee";


 
const reviews = [
  {
    name: "Dr. Smith",
    username: "Professor of AI",
    body: "The platform is transformative! It's intuitive and enhances the learning experience significantly.",
    img: "https://avatar.vercel.sh/drsmith",
  },
  {
    name: "Dr. Taylor",
    username: "Professor of Data Science",
    body: "This platform simplifies resource sharing and fosters collaboration among students and faculty.",
    img: "https://avatar.vercel.sh/drtaylor",
  },
  {
    name: "Alex Johnson",
    username: "Student of Computer Science",
    body: "I've learned so much with the tools and resources provided. It's a game-changer for my studies!",
    img: "https://avatar.vercel.sh/alexjohnson",
  },
  {
    name: "Emily Carter",
    username: "Student of Business Management",
    body: "I love how the platform organizes everything seamlessly. It’s been an essential part of my learning journey.",
    img: "https://avatar.vercel.sh/emilycarter",
  },
  {
    name: "Michael Brown",
    username: "Student of Mechanical Engineering",
    body: "The accessibility and real-time updates make it the best platform I've used for learning.",
    img: "https://avatar.vercel.sh/michaelbrown",
  },
  {
    name: "Sophia Davis",
    username: "Student of Design",
    body: "The interactive tools and intuitive design have boosted my productivity and creativity.",
    img: "https://avatar.vercel.sh/sophiadavis",
  },
  ];

  const images = [
    "/Slice1.png", 
    "/Slice2.png",
    "/Slice3.png",
  ];
   
  const firstRow = reviews.slice(0, reviews.length / 2);
  
   
  const ReviewCard = ({
    img,
    name,
    username,
    body,
  }: {
    img: string;
    name: string;
    username: string;
    body: string;
  }) => {
    return (
      <figure
        className={cn(
          "relative w-72 h-40 cursor-pointer overflow-hidden rounded-xl border p-4",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <img className="rounded-full" width="32" height="32" alt="" src={img} />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{username}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm">{body}</blockquote>
      </figure>
    );
  };
   
  export function MarqueeComp() {
    return (
      <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
    );
  }

  export function ClassroomMarquee() {
    
  
    return (
      <div className="hidden md:flex absolute inset-0 w-full  flex h-[300px] w-full items-center justify-center overflow-hidden rounded-lg transition-all duration-200 ease-in-out hover:scale-[105%]">
        <Marquee pauseOnHover className="[--duration:15s]">
          {images.map((image, index) => (
            <div key={index} className="flex items-center justify-center mx-4">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-[400px] rounded-lg object-contain" // Ensure full size without distortion
              />
            </div>
          ))}
        </Marquee>
    
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
    );
    
  }