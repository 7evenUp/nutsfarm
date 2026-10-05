export const finalLessonAnimation = [
  //setup styles
  [
    ".your-reward-text",
    {
      bottom: 0,
      opacity: 0,
      transform: "translate(-50%)",
    },
    { duration: 0, at: "<" },
  ],
  [
    ".congratulation-text",
    {
      bottom: 0,
      opacity: 0,
      transform: "translate(-50%)",
    },
    { duration: 0, at: "<" },
  ],
  [
    ".bottom-animation",
    {
      bottom: "-20%",
      opacity: 0,
      transform: "translateX(-50%) scale(0.8)",
    },
    { duration: 0, at: "<" },
  ],
  [
    ".feedback-badges ",
    {
      bottom: "-20%",
      opacity: 0,
      transform: "scale(0.8)",
    },
    { duration: 0, at: "<" },
  ],
  [
    ".your-reward",
    {
      bottom: "-20%",
      opacity: 0,
      transform: "scale(0.8)",
    },
    { duration: 0, at: "<" },
  ],
  [
    ".claim-btn",
    {
      transform: "translateY(100px)",
      opacity: 0,
    },
    { duration: 0, at: "<" },
  ],
  // Начало анимации
  [
    ".congratulation-text",
    {
      bottom: "70%",
      // top: "34%",
      opacity: 1,
      transform: "translate(-50%)",
    },
    { duration: 0.8, at: ">", ease: "easeInOut" },
  ],
  [
    ".bottom-animation",
    { bottom: 0, opacity: 1, transform: "translateX(-50%) scale(1)" },
    { duration: 1, at: "-0.8", ease: "easeInOut" },
  ],

  //вторая стадия
  [
    ".bottom-animation",
    { bottom: "-20%", opacity: 0, transform: "translateX(-50%) scale(1)" },
    { duration: 1, at: "+2", ease: "easeInOut" },
  ],

  [
    ".congratulation-text",
    {
      bottom: "-20%",
      opacity: 0,
      transform: "translate(-50%)",
    },
    { duration: 0.8, at: "<", ease: "easeInOut" },
  ],

  //поялвение статов
  [
    ".feedback-badges ",
    {
      bottom: "80%",
      opacity: 1,
      transform: "scale(1)",
    },
    { duration: 1, at: "-0.8", ease: "easeInOut" },
  ],
  [
    ".your-reward-text",
    {
      bottom: "40%",
      opacity: 1,
      transform: "translate(-50%)",
    },
    { duration: 0.8, ease: "easeInOut" },
  ],
  [
    ".your-reward",
    {
      bottom: "30%",
    //   opacity: isClaimed ? 0.5 : 1,
      transform: "scale(1)",
    },
    { duration: 0.8, at: "<", ease: "easeInOut" },
  ],
  [
    ".claim-btn",
    {
      transform: "translateY(0)",
      opacity: 1,
    },
    { delay: 0.6, duration: 0.8, at: "<", ease: "easeInOut" },
  ],
]
