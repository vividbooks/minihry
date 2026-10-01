/**
 * Předčítání pro děti, které ještě neumí číst: hlas prohlížeče (Web Speech API), česky.
 * Bez přihlášení a bez sítě – minihry hrají i hosté.
 */

function czechVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === 'cs-CZ') ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('cs'));
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakCzech(text: string): void {
  if (!canSpeak() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'cs-CZ';
  utterance.rate = 0.92;
  const voice = czechVoice();
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
