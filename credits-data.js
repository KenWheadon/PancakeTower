// Credits Data Structure
const CREDITS = {
  Ken: {
    name: "Kenneth Wheadon",
    jobTitle: "Game Lead",
    department: "Game Development",
    previewImage: "images/ken-head.png",
    fullImage: "images/ken-head.png",
    description: "Ken ken ken",
  },

  Jessy: {
    name: "Wyrmskin",
    jobTitle: "Lead Artist",
    department: "Art",
    previewImage: "images/wyrmskin-head.png",
    fullImage: "images/wyrmskin-head.png",
    description:
      "Jessy-Jean also known as Wyrmskin created the current company logo and helps with art as needed.",
  },

  Freesounds: {
    name: "FreeSounds.com",
    jobTitle: "Sound Effects",
    department: "Audio",
    previewImage: "images/freesound-head.png",
    fullImage: "images/freesound-logo.png",
    description:
      "Lots of differnet people contributed to free sounds where I gathered most of the sound effect from. They are: ......",
  },

  Gamesounds: {
    name: "gamesounds.com",
    jobTitle: "Sound Effects",
    department: "Audio",
    previewImage: "images/px-head.png",
    fullImage: "images/px-head.png",
    description:
      "Lots of differnet people contributed to free sounds where I gathered most of the sound effect from. They are: ......",
  },

  Suno: {
    name: "Suno 3.5",
    jobTitle: "Background Music",
    department: "Audio",
    previewImage: "images/suno35-head.png",
    fullImage: "images/suno35-head.png",
    description: "Suno 3.5",
  },

  Claude: {
    name: "Claude Sonnet 4.0",
    jobTitle: "Lead Programmer",
    department: "Game Development",
    previewImage: "images/sonnet4-head.png",
    fullImage: "images/sonnet4-head.png",
    description:
      "David led the testing efforts to ensure the game runs smoothly across different devices and browsers. His meticulous testing approach identified edge cases and helped refine the gameplay balance, ensuring players have a polished cooking experience.",
  },

  Chatgpt: {
    name: "ChatGPT GPT‑4o",
    jobTitle: "Artist",
    department: "Art",
    previewImage: "images/chatgpt4o-head.png",
    fullImage: "images/chatgpt4o-head.png",
    description:
      "ChatGPT with it's ability to chat, include refernce and modify existing images makes it a powerhouse for quick graphic development.",
  },

  Photoshop: {
    name: "Photoshop Genfill",
    jobTitle: "Junior Artist",
    department: "Art",
    previewImage: "images/psgen-head.png",
    fullImage: "images/psgen-head.png",
    description:
      "While not up to the same quality level, genfill helps extend background, clean up noise, and can do a lot of the small cleanup that chatGPT isn't able to do.",
  },

  Grok: {
    name: "Grok",
    jobTitle: "Prototyper",
    department: "Game Development",
    previewImage: "images/grok-head.png",
    fullImage: "images/grok-head.png",
    description:
      "Grok can help build initial prototypes - but only so that Claude doesn't spend their energy on the little stuff.",
  },
};

// Helper function to get all departments (similar to categories in character gallery)
function getAllDepartments() {
  const departments = new Set();
  Object.values(CREDITS).forEach((person) => {
    departments.add(person.department);
  });
  return Array.from(departments).sort();
}
