import { z } from 'zod'
import { anyEmailSchema, messageSchema, nameSchema } from '@shared/schemas/common'

export const contactSchema = z.object({
    firstname: nameSchema,
    lastname: nameSchema,
    email: anyEmailSchema,
    message: messageSchema
})

