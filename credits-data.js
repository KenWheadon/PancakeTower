const CREDITS = {
  Ken: {
    name: "Kenneth Wheadon",
    jobTitle: "Game Lead",
    department: "Game Development",
    previewImage: "images/ken-head.png",
    fullImage: "images/ken-head.png",
    description:
      "Kenneth Wheadon serves as the Game Lead, overseeing the overall game development process and ensuring project coordination across all teams.",
  },

  Jessy: {
    name: "Wyrmskin",
    jobTitle: "Lead Artist",
    department: "Art",
    previewImage: "images/wyrmskin-head.png",
    fullImage: "images/wyrmskin-head.png",
    description:
      "Jessy-Jean, also known as Wyrmskin, created the current company logo and provides artistic direction and support as needed.",
  },

  Freesounds: {
    name: "FreeSounds.com",
    jobTitle: "Sound Effects",
    department: "Audio",
    previewImage: "images/freesound-head.png",
    fullImage: "images/freesound-logo.png",
    description:
      "Multiple contributors from FreeSounds.com provided the majority of sound effects used throughout the game experience.",
  },

  Gamesounds: {
    name: "gamesounds.com",
    jobTitle: "Sound Effects",
    department: "Audio",
    previewImage: "images/px-head.png",
    fullImage: "images/px-head.png",
    description:
      "Additional sound effects contributors from gamesounds.com helped expand the audio library for enhanced gameplay immersion.",
  },

  Suno: {
    name: "Suno 3.5",
    jobTitle: "Background Music",
    department: "Audio",
    previewImage: "images/suno35-head.png",
    fullImage: "images/suno35-head.png",
    description:
      "Suno 3.5 AI generated the atmospheric background music that enhances the gaming experience.",
  },

  Claude: {
    name: "Claude Sonnet 4.0",
    jobTitle: "Lead Programmer",
    department: "Game Development",
    previewImage: "images/sonnet4-head.png",
    fullImage: "images/sonnet4-head.png",
    description:
      "Claude Sonnet 4.0 led the programming efforts, implementing core game mechanics and ensuring robust, maintainable code architecture.",
  },

  Chatgpt: {
    name: "ChatGPT GPT‑4o",
    jobTitle: "Artist",
    department: "Art",
    previewImage: "images/chatgpt4o-head.png",
    fullImage: "images/chatgpt4o-head.png",
    description:
      "ChatGPT GPT-4o contributed to rapid graphic development through its image generation and modification capabilities.",
  },

  Photoshop: {
    name: "Photoshop Genfill",
    jobTitle: "Junior Artist",
    department: "Art",
    previewImage: "images/psgen-head.png",
    fullImage: "images/psgen-head.png",
    description:
      "Photoshop Generative Fill assisted with background extensions, noise cleanup, and detailed image refinements.",
  },

  Grok: {
    name: "Grok",
    jobTitle: "Prototyper",
    department: "Game Development",
    previewImage: "images/grok-head.png",
    fullImage: "images/grok-head.png",
    description:
      "Grok contributed to initial prototype development, handling preliminary implementations and concept validation.",
  },
};

function getAllDepartments() {
  const departments = new Set(
    Object.values(CREDITS).map((person) => person.department)
  );
  return Array.from(departments).sort();
}
