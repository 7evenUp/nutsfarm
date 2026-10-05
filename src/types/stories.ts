export interface Story {
  description: string
  descriptionEn: string
  expiredAt: number
  id: string
  lang: "RU" | "EN"
  storyParts: StoryPart[]
  storyType: "PUBLIC" | "TASK_ONLY"
  title: string
  titleEn: string
  pointsBonus: number
  image: string | null
  imageEn: string | null
  pageNumber: number | null
}

export interface StoryPart {
  buttonText: null | string
  buttonTextEn: null | string
  description: string
  descriptionEn: string
  id: string
  image: string
  imageEn: string
  pointsBonus: number
  storyId: number
  title: string
  titleEn: string
  url: string
  urlEn: string
}

export interface UserStory {
  id: string
  createdAt: string
  story: Story
}
