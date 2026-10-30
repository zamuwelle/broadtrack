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
