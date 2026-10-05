export const isHexColor = (color: string):boolean => {
    return /^#[0-9A-F]{6}$/i.test(color)
}