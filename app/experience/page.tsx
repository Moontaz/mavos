import { VoiceExperience } from '@/components/voice/VoiceExperience';
import { PageReveal } from '@/components/ui/PageReveal';

export default function ExperiencePage() {
  return <PageReveal><VoiceExperience /><section className="privacy-strip page-frame"><span className="eyebrow">PRIVACY / BROWSER FIRST</span><p>Microphone audio is used for the live visualization. MAVOS does not store recordings. Speech recognition behavior depends on the browser you choose.</p></section></PageReveal>;
}
