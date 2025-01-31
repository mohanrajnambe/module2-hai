import extremeOwnership from '../assets/extreme_ownership.jpg';
import infiniteGame from '../assets/infinite_game.png';
import innovatorsDilemma from '../assets/innovators_dilemma.jpg';
import moonshot from '../assets/moonshot.jpg';
import thinkingFastSlow from '../assets/thinking_fast_slow.jpg';
import unreasonable from '../assets/unreasonable.jpg';
import kevinWatkins from '../assets/kevin_watkins.png';
import rajeev from '../assets/rajeev.jpeg';
import sharanGurunathan from '../assets/sharan_gurunathan.png';
import sujithra from '../assets/sujithra.jpeg';
import caitlin from '../assets/caitlin.jpg';
import cultureMap from '../assets/the_culture_map.jpg';

export const books = [
  {
    id: '1e7b9f1e-8f3b-4c2a-9f1e-1e7b9f1e8f3b',
    title: 'Extreme Ownership',
    author: 'Jocko Willink',
    thumbnail: extremeOwnership,
    about: 'A compelling leadership book by former Navy SEAL officers sharing combat experiences and principles. They emphasize that leaders must own everything in their world, take complete responsibility for failures, and lead by example. The book demonstrates how these military leadership principles apply effectively in business and life.',
    notes: [
      { text: `As a former military person I often find that few books written my military leaders have strong application to Business leaders.  The work, afterall, is so very different;  so I can understand why some business leaders shy away from books written by military folks. 
But what sets this book apart is that its focus isn’t on the “work”, it’s on the “people”, specifically how to best lead people through performance issues.  It presents the simple but powerful concept of “extreme ownership”….When you or someone on your team makes a mistake, hiding it is a disaster.  Just “Owning it” (simply admitting it happened but given excuses) doesn’t provide much more value.  But EXTREME ownership…admitting it, discussing it, analyzing it, learning from it, and using those lessons learned to inform future decisions solves SO MANY problems.  It also creates a culture where failure isn’t shameful but a great feedback mechanism to the business.  It’s one of the best leadership books I’ve read on taking responsibility, improving yourself and your team. `, contributor: "Caitlin Schuman", imageUrl: caitlin },
      { text: "Leadership is about taking responsibility.", contributor: "Kevin Watkins", imageUrl: kevinWatkins }
    ]
  },
  {
    id: '2f8c0a2f-9d4c-5b3a-8c2f-2f8c0a2f9d4c',
    title: 'The Infinite Game',
    author: 'Simon Sinek',
    thumbnail: infiniteGame,
    about: 'Simon Sinek challenges traditional business thinking by introducing the concept of finite versus infinite games. He argues that successful leaders adopt an infinite mindset, focusing on long-term value and sustainable practices rather than short-term wins, creating resilient organizations that thrive in an ever-changing business landscape.',
    notes: [
      { text: "Start with why.", contributor: "Rajeev Ramesh", imageUrl: rajeev },
      { text: "The goal is not to beat your competition, but to outlast them.", contributor: "Sharan Gurunathan", imageUrl: sharanGurunathan }
    ]
  },
  {
    id: '3g9d1b3g-0e5d-6c4b-9d3g-3g9d1b3g0e5d',
    title: 'The Innovator\'s Dilemma',
    author: 'Clayton Christensen',
    thumbnail: innovatorsDilemma,
    about: 'This groundbreaking book explores why successful companies often fail when faced with disruptive innovation. Christensen reveals how good management practices can lead to failure when dealing with technological shifts. He provides insights into recognizing and responding to disruptive technologies while maintaining competitive advantage.',
    notes: [
      { text: "Disrupt yourself before others do.", contributor: "Sujithra Gunasekaran", imageUrl: sujithra },
      { text: "Innovation is the only way to win.", contributor: "Sharan Gurunathan", imageUrl: sharanGurunathan }
    ]
  },
  {
    id: '4h0e2c4h-1f6e-7d5c-0e4h-4h0e2c4h1f6e',
    title: 'Moonshot',
    author: 'Richard Wiseman',
    thumbnail: moonshot,
    about: 'Moonshot explores the psychology and science behind achieving seemingly impossible goals. Through fascinating research and real-world examples, Wiseman reveals how breakthrough thinking and audacious goals can lead to extraordinary achievements. The book provides practical strategies for turning ambitious dreams into reality.',
    notes: [
      { text: "Shoot for the moon. Even if you miss, you'll land among the stars.", contributor: "Sujithra Gunasekaran", imageUrl: sujithra },
      { text: "Dream big, start small.", contributor: "Rajeev Ramesh", imageUrl: rajeev }
    ]
  },
  {
    id: '5i1f3d5i-2g7f-8e6d-1f5i-5i1f3d5i2g7f',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    thumbnail: thinkingFastSlow,
    about: 'Nobel laureate Daniel Kahneman explores the two systems that drive human thinking: the fast, intuitive System 1, and the slow, logical System 2. Through decades of groundbreaking research, he reveals the cognitive biases that influence our decision-making and explains how to make better choices.',
    notes: [
      { text: "We are what we repeatedly do.", contributor: "Caitlin Schuman", imageUrl: caitlin },
      { text: "Thinking is the hardest work there is.", contributor: "Kevin Watkins", imageUrl: kevinWatkins }
    ]
  },
  {
    id: '6j2g4e6j-3h8g-9f7e-2g6j-6j2g4e6j3h8g',
    title: 'Unreasonable Hospitality',
    author: 'Will Guidara',
    thumbnail: unreasonable,
    about: 'Will Guidara shares his transformative approach to hospitality, developed while leading world-renowned restaurant Eleven Madison Park. He demonstrates how going above and beyond conventional service creates unforgettable experiences. The book reveals how exceptional hospitality can revolutionize any business or relationship.',
    notes: [
      { text: "Hospitality is about making people feel good.", contributor: "Caitlin Schuman", imageUrl: caitlin },
      { text: "The unreasonable man adapts the world to himself.", contributor: "Kevin Watkins", imageUrl: kevinWatkins }
    ]
  },
  {
    id: "5i1f3d5i-2g7f-8e6d-1f5i-5i1f3d5i3f7g",
    title: "The Culture Map",
    author: "Erin Meyer",
    thumbnail: cultureMap,
    about: "Whether you work in a home office or abroad, business success in our ever more globalized and virtual world requires the skills to navigate through cultural differences and decode cultures foreign to your own. Renowned expert Erin Meyer is your guide through this subtle, sometimes treacherous terrain where people from starkly different backgrounds are expected to work harmoniously together.",
    notes: [
      {
        text: "Understanding how your counterparts build trust, persuades, and evaluates the ideas of others will help you to approach their perspective - Erin Meyer\n\nThe Culture Map: Breaking Through the Invisible Boundaries of Global Business by Erin Meyer is a must read for global teams to acknowledge and learn from cultural differences. To be able to blend them to create a more resilient team culture. Gives the reader insights into the unexplored dynamics of global business.\n\nErin takes us through eight simple yet key dimensions that shape the ways people communicate, make decisions, and approach hierarchy. With practical examples and clear frameworks, this book would help leaders bridge cultural differences, build stronger teams, and enhance collaboration\n",
        contributor: "Sujithra Gunasekaran",
        imageUrl: "sujithra.jpeg"
      }
    ]
  }
];
