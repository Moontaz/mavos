import { projects } from "@/data/projects";
import type { CommandAction, VoiceCommand } from "@/lib/types";

const normalize = (value: string) =>
   value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

const routes: Array<{
   action: CommandAction;
   aliases: string[];
   label: string;
}> = [
   {
      action: "SHOW_HOME",
      aliases: ["home", "go home", "take me home", "show home"],
      label: "GO HOME",
   },
   {
      action: "SHOW_EXPERIENCE",
      aliases: [
         "experience",
         "voice experience",
         "open experience",
         "show experience",
      ],
      label: "OPEN EXPERIENCE",
   },
   {
      action: "SHOW_PROJECTS",
      aliases: [
         "projects",
         "show projects",
         "show my projects",
         "show me your projects",
         "work",
         "portfolio",
      ],
      label: "SHOW PROJECTS",
   },
   {
      action: "SHOW_ABOUT",
      aliases: [
         "about",
         "about me",
         "tell me about you",
         "who are you",
         "who are you",
      ],
      label: "OPEN ABOUT",
   },
   {
      action: "GO_BACK",
      aliases: ["go back", "back", "previous page"],
      label: "GO BACK",
   },
   {
      action: "GO_FORWARD",
      aliases: ["go forward", "forward", "next page"],
      label: "GO FORWARD",
   },
   {
      action: "NEXT_PROJECT",
      aliases: ["next project", "show next project"],
      label: "NEXT PROJECT",
   },
   {
      action: "PREVIOUS_PROJECT",
      aliases: ["previous project", "show previous project"],
      label: "PREVIOUS PROJECT",
   },
   {
      action: "HELP",
      aliases: ["help", "i need help", "what can i say"],
      label: "OPEN HELP",
   },
   {
      action: "SHOW_COMMANDS",
      aliases: ["commands", "show commands", "command guide"],
      label: "SHOW COMMANDS",
   },
];

export function parseCommand(transcript: string): VoiceCommand | null {
   const value = normalize(transcript);
   if (!value) return null;

   const project = projects.find((item) => {
      const title = normalize(item.title);
      return value.includes(title) && /open|show|view|visit|see/.test(value);
   });

   if (project) {
      return {
         action: "OPEN_PROJECT",
         label: `OPEN PROJECT / ${project.title.toUpperCase()}`,
         projectSlug: project.slug,
         rawTranscript: transcript,
      };
   }

   const route = routes.find((item) =>
      item.aliases.some((alias) => value === alias || value.includes(alias)),
   );
   if (!route) return null;
   return {
      action: route.action,
      label: route.label,
      rawTranscript: transcript,
   };
}

export const commandExamples = [
   {
      category: "Navigation",
      items: [
         "Go home",
         "Show my projects",
         "Tell me about you",
         "Open experience",
      ],
   },
   {
      category: "Projects",
      items: [
         "Open Saling Pandu",
         "Open Smile Detector",
         "Open MAVOS",
         "Next project",
      ],
   },
   {
      category: "System",
      items: ["Hey MAVOS, show projects", "Help", "What can I say?", "Go back"],
   },
];
