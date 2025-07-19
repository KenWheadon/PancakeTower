const CREDITS = {
  Ken: {
    name: "Kenneth Wheadon",
    jobTitle: "Game Lead",
    department: "Game Development",
    previewImage: "images/ken-head.png",
    fullImage: "images/ken-head.png",
    description:
      "I've loved games since I can remember and love to come up with new ideas and create fun experiences. I've been involved in game development since I was in middleschool, first making things for Newgrounds and trying to get through to the website - these were all bad dressup monster games, weird story's and a few attempts at animations. Game design was clearly the only option after highschool graduation so I went a community college to take game design and flash programming. After 3 years and several internships I graduated with 2 degrees and landed myself a job making lottery games - first as part of a small team and eventually being bought out and working for one of the largest players in the lottery industry. I was burnt out and didn't enjoy my job any more as the culture at larger companies wasn't a good fit for me. I pivoted and took my experience with game design and development and joined another small team - but this time making elearning software. Here I focused on honing my skills, while I kept picking away at game development in my spare time. As generative technology really hit the scene in 2022 - I imedpently jumped on it as I saw the huge potential for my game development and it's ability to get past the largest hurdle I kept facing with my personal projects. I tend to hyper focus, and when I'm doing something it's all I think about - but I can only keep it up for a few weeks at most, and if I keep pushing myself past that (2 - 3 - 4 months) then I get burnt out and end up crashing. This would lead to 6 month periods where I didn't even want to think about game development and I'd question if I'd ever be able to follow my dreams or if I'd just accept that it wasn't for me. I felt a lot of self doubt, and a huge amount of imposter syndrome.",
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
