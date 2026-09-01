export const formatPhone = (phone) => {
    if (!phone) {
        return ''
    }
    const hasPlus = phone.startsWith('+')
    const digits = phone.replaceAll(/\D/gu, '')

    if (hasPlus || digits.startsWith('63')) {
        if (digits.startsWith('63')) {
            const prefix = hasPlus ? '+63' : '63'
            const raw = digits.slice(2)
            let result = prefix
            if (raw.length > 0) {
                result = `${result} ${raw.slice(0, 3)}`
            }
            if (raw.length > 3) {
                result = `${result} ${raw.slice(3, 6)}`
            }
            if (raw.length > 6) {
                result = `${result} ${raw.slice(6, 10)}`
            }
            return result
        }
        return `+${digits.slice(0, 12)}`
    }

    let result = digits.slice(0, 4)
    if (digits.length > 4) {
        result = `${result} ${digits.slice(4, 7)}`
    }
    if (digits.length > 7) {
        result = `${result} ${digits.slice(7, 11)}`
    }
    return result
}
