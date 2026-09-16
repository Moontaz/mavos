export type VoiceState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'READY'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'PROCESSING'
  | 'COMMAND_RECOGNIZED'
  | 'EXECUTING'
  | 'SUCCESS'
  | 'ERROR'
  | 'UNSUPPORTED';

export type CommandAction =
  | 'SHOW_HOME'
  | 'SHOW_EXPERIENCE'
  | 'SHOW_PROJECTS'
  | 'SHOW_ABOUT'
  | 'OPEN_PROJECT'
  | 'GO_BACK'
  | 'GO_FORWARD'
  | 'NEXT_PROJECT'
  | 'PREVIOUS_PROJECT'
  | 'HELP'
  | 'SHOW_COMMANDS'
  | 'START_LISTENING'
  | 'STOP_LISTENING';

export interface VoiceCommand {
  action: CommandAction;
  label: string;
  rawTranscript: string;
  projectSlug?: string;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  type: string;
  year: string;
  description: string;
  role: string;
  technologies: string[];
  features: string[];
  url?: string;
  accent: string;
}

export type OnboardingStep = 'intro' | 'how' | 'permission' | 'check' | 'complete';
