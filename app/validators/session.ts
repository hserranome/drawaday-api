import vine from '@vinejs/vine';

export const createSessionValidator = vine.compile(
    vine.object({
        email: vine.string().trim().email().toLowerCase(),
        password: vine.string().trim().escape()
    })
)