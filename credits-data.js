// Credits Data Structure
const CREDITS = {
  Ken: {
    name: "Kenneth Wheadon",
    jobTitle: "Game Lead",
    department: "Game Development",
    previewImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    description: "Ken ken ken",
  },

  Jessy: {
    name: "Wyrmskin",
    jobTitle: "Lead Artist",
    department: "Art",
    previewImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b282?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b282?w=400&h=400&fit=crop&crop=face",
    description:
      "Jessy-Jean also known as Wyrmskin created the current company logo and helps with art as needed.",
  },

  Freesounds: {
    name: "FreeSounds.com",
    jobTitle: "Sound Effects",
    department: "Audio",
    previewImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    description:
      "Lots of differnet people contributed to free sounds where I gathered most of the sound effect from. They are: ......",
  },

  Gamesounds: {
    name: "gamesounds.com",
    jobTitle: "Sound Effects",
    department: "Audio",
    previewImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    description:
      "Lots of differnet people contributed to free sounds where I gathered most of the sound effect from. They are: ......",
  },

  Suno: {
    name: "Suno 3.5",
    jobTitle: "Background Music",
    department: "Audio",
    previewImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    description: "Suno 3.5",
  },

  Claude: {
    name: "Claude Sonnet 4.0",
    jobTitle: "Lead Programmer",
    department: "Game Development",
    previewImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    description:
      "David led the testing efforts to ensure the game runs smoothly across different devices and browsers. His meticulous testing approach identified edge cases and helped refine the gameplay balance, ensuring players have a polished cooking experience.",
  },

  Chatgpt: {
    name: "ChatGPT GPT‑4o",
    jobTitle: "Artist",
    department: "Art",
    previewImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    description:
      "ChatGPT with it's ability to chat, include refernce and modify existing images makes it a powerhouse for quick graphic development.",
  },

  Photoshop: {
    name: "Photoshop Genfill",
    jobTitle: "Junior Artist",
    department: "Art",
    previewImage:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    description:
      "While not up to the same quality level, genfill helps extend background, clean up noise, and can do a lot of the small cleanup that chatGPT isn't able to do.",
  },

  Grok: {
    name: "Grok",
    jobTitle: "Prototyper",
    department: "Game Development",
    previewImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
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
