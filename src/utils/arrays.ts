export function arraysEqual(arr1: string[], arr2: string[]): boolean {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)

  if (set1.size !== set2.size) return false

  for (const item of set1) {
    if (!set2.has(item)) {
      return false
    }
  }

  return true
}

export function shuffleArray<T>(array: Array<T>): Array<T> {
  // Create a copy of the original array to avoid mutating it directly
  const shuffledArray = array.slice()

  // Loop through the array from the last element to the first
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1))

    // Swap elements at indices i and j
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
}
