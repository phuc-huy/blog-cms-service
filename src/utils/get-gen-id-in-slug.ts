export const getGenIdInSlug = (slug) => {
    const arr = slug.split("-")

    if (arr.length) {
        return arr[arr.length - 1]
    }
    return ""
}
