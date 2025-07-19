// Credits Data Structure
const CREDITS = {
  "game-designer": {
    name: "Alex Johnson",
    jobTitle: "Lead Game Designer",
    department: "Design",
    previewImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    description:
      "Alex conceptualized the core mechanics of the Pancake Stack Game, focusing on creating an engaging and intuitive cooking simulation experience. With over 8 years in game design, Alex specializes in casual gaming experiences that are easy to learn but challenging to master.",
  },

  "lead-developer": {
    name: "Sarah Chen",
    jobTitle: "Lead Developer",
    department: "Engineering",
    previewImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b282?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b282?w=400&h=400&fit=crop&crop=face",
    description:
      "Sarah architected the game's technical foundation, implementing the cooking mechanics, timing systems, and state management. Her expertise in JavaScript and game development frameworks brought the pancake cooking experience to life with smooth animations and responsive controls.",
  },

  "ui-designer": {
    name: "Marcus Thompson",
    jobTitle: "UI/UX Designer",
    department: "Design",
    previewImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    description:
      "Marcus crafted the visual identity and user interface design for the game. His warm color palette and intuitive layouts create an inviting cooking atmosphere while ensuring players can easily navigate through menus and gameplay elements.",
  },

  "sound-designer": {
    name: "Emma Rodriguez",
    jobTitle: "Sound Designer",
    department: "Audio",
    previewImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    description:
      "Emma designed the audio landscape of the game, creating satisfying sizzling sounds, cheerful UI feedback, and ambient kitchen atmosphere. Her attention to audio detail enhances the cooking experience and provides important gameplay feedback to players.",
  },

  "qa-tester": {
    name: "David Kim",
    jobTitle: "Quality Assurance Lead",
    department: "Testing",
    previewImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    description:
      "David led the testing efforts to ensure the game runs smoothly across different devices and browsers. His meticulous testing approach identified edge cases and helped refine the gameplay balance, ensuring players have a polished cooking experience.",
  },

  artist: {
    name: "Luna Park",
    jobTitle: "2D Artist",
    department: "Art",
    previewImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    description:
      "Luna created all the visual assets for the game, from pancake animations to kitchen equipment sprites. Her artistic style brings warmth and personality to the cooking environment, making each pancake feel satisfyingly real and appetizing.",
  },

  producer: {
    name: "Michael O'Connor",
    jobTitle: "Executive Producer",
    department: "Production",
    previewImage:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    description:
      "Michael oversaw the entire production pipeline, coordinating between teams and ensuring the project stayed on schedule. His leadership and vision helped transform the initial pancake game concept into the polished experience players enjoy today.",
  },

  "community-manager": {
    name: "Zoe Williams",
    jobTitle: "Community Manager",
    department: "Marketing",
    previewImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    fullImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    description:
      "Zoe manages our player community and gathers valuable feedback to improve the game. Her engaging communication style and dedication to player satisfaction helps create a positive environment around the Pancake Stack Game.",
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
