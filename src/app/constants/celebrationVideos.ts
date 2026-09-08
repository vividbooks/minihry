export interface CelebrationVideo {
  url: string;
  backgroundColor: string;
}

export const CELEBRATION_VIDEOS: CelebrationVideo[] = [
  {
    url: "https://github.com/vividbooks/Prvouka/raw/refs/heads/main/uploads/oslava_1%20(2).mp4",
    backgroundColor: "#FEF4E8"
  },
  {
    url: "https://github.com/vividbooks/Prvouka/raw/refs/heads/main/uploads/oslava_2.mp4",
    backgroundColor: "#FEFEFE"
  },
  {
    url: "https://github.com/vividbooks/Prvouka/raw/refs/heads/main/uploads/oslava_3.mp4",
    backgroundColor: "#FAF3CF"
  },
  {
    url: "https://github.com/vividbooks/Prvouka/raw/refs/heads/main/uploads/oslava_4.mp4",
    backgroundColor: "#FCF4E9"
  }
];

export const getRandomCelebrationVideo = (): CelebrationVideo => {
  return CELEBRATION_VIDEOS[Math.floor(Math.random() * CELEBRATION_VIDEOS.length)];
};