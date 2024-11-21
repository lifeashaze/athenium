
import { BentoCard, BentoGrid } from "../components/ui/bento-grid";
import { BellIcon} from "@radix-ui/react-icons";
import { BotMessageSquare,School,AlignStartVertical, UserRound,File } from 'lucide-react';
import { AnimatedBeamM } from "@/components/MultipleBeam";
import { ClassroomMarquee } from "./Marquee";
import { AnimatedListComp } from "./AnimatedList";
import { AnimatedProgressBar } from "./ProgressBar";
import Image from 'next/image';
import brain from "/public/brain.png"
import brainDark from "/public/brainDark.png"
import file from "/public/file.png"
import fileDark from "/public/file-dark.png"



const features = [
    {
      Icon: UserRound,
      name: "Smart assignment generation",
      description: "Create and set-up assignments seamlessly.",
      href: "/",
      cta: "Learn more",
      background: 
      <div className="absolute inset-0 flex items-center justify-center translate-y-[-70px]  transition-all duration-200 ease-in-out hover:scale-[105%]  ">
          <Image
                src={brain}
                alt="Brain"
                className="w-[140px] h-auto object-contain mx-auto dark:hidden"
                priority 
            />
            <Image
                src={brainDark} 
                alt="Brain"
                className="w-[140px] h-auto object-contain mx-auto hidden dark:block"
                priority
    />
      </div>,
      className: "lg:row-start-1 lg:row-end-3 lg:col-start-3 lg:col-end-4 relative",
    },
    {
      Icon: BotMessageSquare,
      name: "Intelligent resource assistant",
      description: "Gemini powered assistant to answer all your academic questions.",
      href: "/",
      cta: "Learn more",
      className: "lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-3 group relative",
      background:( 
      <AnimatedBeamM  />
       ),
      
    },
    {
      Icon: BellIcon,
      name: "Notifications",
      description: "get notified when a new assignement is uploaded or is due.",
      href: "/",
      cta: "Learn more",
      background: <AnimatedListComp/>,
      className: "relative lg:col-start-4 lg:col-end-5 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: AlignStartVertical,
      name: "Performance Metrics",
      description: "Track grades, submission, and progress to help students excel.",
      href: "/",
      cta: "Learn more",
      background: <div className="h-[-200px] absolute top-1/2 left-1/2  flex justify-center items-center -translate-y-12 transition-all duration-200 ease-in-out hover:scale-[105%] ">
          <AnimatedProgressBar/> 
           
        </div> ,
      className: " relative lg:col-start-1 lg:col-end-1 lg:row-start-3 lg:row-end-5",
    },
    {
      Icon: File,
      name: "Assignment Evaluation System",
      description:
        "Quick and simple assignment evaluation system ",
      href: "/",
      cta: "Learn more",
      background: <div className="absolute inset-0 flex items-center justify-center translate-y-[-70px]  transition-all duration-200 ease-in-out hover:scale-[105%]  ">
      <Image
            src={file}
            alt="Brain"
            className="w-[120px] h-auto object-contain mx-auto dark:hidden"
            priority 
        />
        <Image
            src={fileDark} 
            alt="Brain"
            className="w-[140px] h-auto object-contain mx-auto hidden dark:block"
            priority
          />
  </div>,
      className: "lg:col-start-2 lg:col-end-2 lg:row-start-3 lg:row-end-5",
    },
    {
        Icon: School,
        name: "Classroom  management",
        description:
          "Join, share and save classrooms & files. ",
        href: "/",
        cta: "Learn more",
        background: <ClassroomMarquee />,
        className: "lg:col-start-3 lg:col-end-5 lg:row-start-3 lg:row-end-5 relative",
      },
  ];

  export  function Bento() {
    return (
      <BentoGrid className="lg:grid-rows-5 mb-4">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    );
  }
