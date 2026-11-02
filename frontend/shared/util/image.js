export const getOptimizedImageUrl = (url, width = 600, height = 300) => {
    if (typeof url !== 'string') {
        return url
    }
    if (url.includes('/upload/')) {
        const transform = height
            ? `f_auto,q_auto,c_pad,b_white,w_${width},h_${height}`
            : `f_auto,q_auto,w_${width},c_limit`
        return url.replace('/upload/', `/upload/${transform}/`)
    }
    return url
}

export const preloadEquipmentImages = (items = []) => {
    if (typeof globalThis.Image !== 'function' || !Array.isArray(items)) {
        return
    }
    const uniqueUrls = new Set(
        items
            .map((item) => item?.image)
            .filter(Boolean)
            .map((url) => getOptimizedImageUrl(url, 600, 300))
    )
    for (const url of uniqueUrls) {
        const img = new Image()
        img.src = url
    }
}
