import { api } from '@/lib/api-client'

export const uploadProfilePicture = (fileOrFormData) => {
    if (fileOrFormData instanceof FormData) {
        return api.post('/profile/picture', fileOrFormData)
    }
    const formData = new FormData()
    formData.append('image', fileOrFormData)
    return api.post('/profile/picture', formData)
}
