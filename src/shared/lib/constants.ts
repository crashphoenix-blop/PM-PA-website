export const appColors = {
  primary: "#524141",
  background: "#E7E1DB",
  secondary: "#A68E8E",
  favActive: "#D18BFF",
  white: "#FFFFFF",
  textMain: "#000000",
  textSecondary: "#E7E1DB",
  imageBlue: "#7EBFFF"
} as const;

export const onboardingSteps = [
  {
    title: "Что тебя ждет\nв приложении",
    description: "",
    image: "/assets/wewewe.svg"
  },
  {
    title: "Подборки",
    description:
      "Мы находимся в постоянном поиске! В наших подборках вы можете найти товары от локальных брендов, а также незаурядные идеи по вашему запросу.",
    image: "/assets/star4.svg"
  },
  {
    title: "Избранное",
    description: "Мы даем вам полный контроль над тем, что вы храните и чем делитесь.",
    image: "/assets/tree.svg"
  },
  {
    title: "Коммьюнити",
    description:
      "Наше приложение – это экосистема, в которой вы можете находиться в постоянном диалоге с новыми брендами и узнавать о российском сообществе еще больше и делиться идеями с друзьями!",
    image: "/assets/ellipse.svg"
  },
  {
    title: "Ура!",
    description: "бегом выбирать\nподарки",
    image: "/assets/star.svg"
  }
] as const;
