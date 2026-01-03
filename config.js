// Centralized configuration — change everything here
window.PROFILE_CONFIG = {
  // Music list: replace paths with your local files or remote URLs. Use objects with src and title.
  musicList: [
    { src: 'in the sea - kensuke ushio.mp3', title: 'In The Sea' },
  ],

  // Crawl text lines (vertical scroll)
  crawlLines: [
    "Some things don't hurt. They just stay.",
    'Quiet observations drift like sakura petals, unseen but felt.',
    'The tiny chess game continues; someone always moves.',
    'Mochi breathes. The page listens.',
    'Slow text, slower heart.'
  ],

  // Socials: edit these links/icons
  socials: [
    {name:'Discord', url:'https://discord.com', icon:'💬'},
    {name:'GitHub', url:'https://github.com', icon:'🐙'},
    {name:'Twitter', url:'https://twitter.com', icon:'🐦'},
    {name:'YouTube', url:'https://youtube.com', icon:'▶️'},
    {name:'AniList', url:'https://anilist.co/user/Hyuunle3i/', icon:'📚'}
  ],

  // Visual defaults (edit here only)
  avatarDefault: 'profile.jpeg',
  description: 'A small handcrafted profile page by Hyun Lee',
  presence: 'idle', // available | idle | dnd | offline
  profileOpacity: 1,
  profileBlur: 0,
  sakura: true,
  accent: '#6aa84f',
  monoIcons: false,
  animatedTitle: true,
  customCursor: false,
  usernameGlow: true,

  // Part 5 controls
  misalignFrequency: 2000, // ms between random letter misaligns
  scrollSpeed: 0.28, // base auto-scroll speed
  showVolume: false,
  showViews: false,
  showChess: true,
  sidebarEnabled: true,
  sidebarCollapsed: false,
  minimalMode: true,

  // Other defaults
  startMuted: true,
  shuffleOnLoad: true
};