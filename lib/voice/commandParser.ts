import { projects } from "@/data/projects";
import type { CommandAction, VoiceCommand } from "@/lib/types";

const normalize = (value: string) =>
   value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

/**
 * Aliases are ordered from most specific to least specific. Longer phrases are
 * checked first so "previous project" is never swallowed by "back".
 * Indonesian and English variants live side by side.
 */
const routes: Array<{
   action: CommandAction;
   aliases: string[];
   label: string;
}> = [
   {
      action: "NEXT_PROJECT",
      aliases: [
         "next project",
         "show next project",
         "proyek selanjutnya",
         "proyek berikutnya",
         "project selanjutnya",
         "project berikutnya",
         "selanjutnya",
         "berikutnya",
      ],
      label: "NEXT PROJECT",
   },
   {
      action: "PREVIOUS_PROJECT",
      aliases: [
         "previous project",
         "show previous project",
         "proyek sebelumnya",
         "project sebelumnya",
         "sebelumnya",
      ],
      label: "PREVIOUS PROJECT",
   },
   {
      action: "SHOW_EXPERIENCE",
      aliases: [
         "voice experience",
         "open experience",
         "show experience",
         "experience",
         "buka pengalaman",
         "pengalaman suara",
         "mode suara",
         "buka mode suara",
      ],
      label: "OPEN EXPERIENCE",
   },
   {
      action: "SHOW_PROJECTS",
      aliases: [
         "show me your projects",
         "show my projects",
         "show projects",
         "projects",
         "portfolio",
         "work",
         "tampilkan proyek",
         "tampilkan project",
         "lihat proyek",
         "lihat project",
         "buka proyek",
         "buka project",
         "tunjukkan proyek",
         "tunjukkan project",
         "proyek saya",
         "proyek",
         "portofolio",
         "karya",
      ],
      label: "SHOW PROJECTS",
   },
   {
      action: "SHOW_ABOUT",
      aliases: [
         "tell me about you",
         "who are you",
         "about me",
         "about",
         "tentang saya",
         "tentang kamu",
         "tentang",
         "siapa kamu",
         "ceritakan tentang kamu",
         "profil",
      ],
      label: "OPEN ABOUT",
   },
   {
      action: "SHOW_HOME",
      aliases: [
         "take me home",
         "go home",
         "show home",
         "home",
         "beranda",
         "ke beranda",
         "kembali ke beranda",
         "halaman utama",
         "ke halaman utama",
         "pulang",
      ],
      label: "GO HOME",
   },
   {
      action: "GO_FORWARD",
      aliases: [
         "go forward",
         "forward",
         "next page",
         "maju",
         "halaman selanjutnya",
      ],
      label: "GO FORWARD",
   },
   {
      action: "GO_BACK",
      aliases: [
         "go back",
         "previous page",
         "back",
         "kembali",
         "balik",
         "mundur",
         "halaman sebelumnya",
      ],
      label: "GO BACK",
   },
   {
      action: "SHOW_COMMANDS",
      aliases: [
         "show commands",
         "command guide",
         "commands",
         "daftar perintah",
         "perintah apa saja",
         "apa yang bisa saya katakan",
         "apa yang bisa aku katakan",
      ],
      label: "SHOW COMMANDS",
   },
   {
      action: "HELP",
      aliases: [
         "what can i say",
         "i need help",
         "help",
         "bantuan",
         "tolong",
         "bantu",
      ],
      label: "OPEN HELP",
   },
];

const openVerbs =
   /\b(open|show|view|visit|see|buka|tampilkan|lihat|tunjukkan|masuk)\b/;

const hasWordBoundaryMatch = (value: string, alias: string) => {
   const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
   return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(value);
};

export function parseCommand(transcript: string): VoiceCommand | null {
   const value = normalize(transcript);
   if (!value) return null;

   const project = projects.find((item) => {
      const title = normalize(item.title);
      return (
         value.includes(title) && (openVerbs.test(value) || value === title)
      );
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
      item.aliases.some(
         (alias) => value === alias || hasWordBoundaryMatch(value, alias),
      ),
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
         "Go home / Ke beranda",
         "Show my projects / Tampilkan proyek",
         "Tell me about you / Tentang kamu",
         "Open experience / Buka mode suara",
      ],
   },
   {
      category: "Projects",
      items: [
         "Open Saling Pandu / Buka Saling Pandu",
         "Open Smile Detector",
         "Open MAVOS",
         "Next project / Proyek selanjutnya",
      ],
   },
   {
      category: "System",
      items: [
         "Press Space to talk",
         "Help / Bantuan",
         "Go back / Kembali",
         "What can I say? / Daftar perintah",
      ],
   },
];
