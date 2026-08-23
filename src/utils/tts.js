// Text To Speech helper for Bengali and English

export const speakText = (text, lang = 'bn-BD') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser/environment');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for clear educational listening
    
    // Find matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang) || v.lang.startsWith(lang.substring(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error('Error in speech synthesis', e);
    return false;
  }
};
