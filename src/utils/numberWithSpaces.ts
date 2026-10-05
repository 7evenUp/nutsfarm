export const numberWithSpaces = (
  numberToEdit: number | string,
  cropNumber?: boolean,
) => {
  if (typeof numberToEdit === "number") {
    if (cropNumber) {
      const oneMil = 1000000

      if (numberToEdit > oneMil) {
        const fixed = (numberToEdit / oneMil).toFixed(2)
        return `${fixed}M`
      }
    }
  }

  const parts = numberToEdit.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  return parts[0]
  // if (parts[1]) parts[1] = parts[1].slice(0, 2)

  // return parts.join(".")
}
