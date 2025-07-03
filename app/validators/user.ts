import vine from '@vinejs/vine';

export const createUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().trim().optional(),
        email: vine.string().trim().email().toLowerCase().unique({
            table: 'users',
            column: 'email',
            caseInsensitive: true,
        }),
        password: vine.string().trim().escape()
    })
)