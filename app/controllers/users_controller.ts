import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { HttpContext } from '@adonisjs/core/http'
import { createUserValidator } from '#validators/user'

export default class UsersController {
    /**
     * @store
     * @summary Registers a new user
     * @tag Auth
     * @requestBody <createUserValidator>
     * @responseBody 201 - <User> - User created
     */
    async store({ request, response }: HttpContext) {
        const data = request.only(['fullName', 'email', 'password'])
        const payload = await createUserValidator.validate(data)

        const user = await User.create({
            fullName: payload.fullName,
            email: payload.email,
            password: await hash.make(payload.password),
        })

        // TODO: Create this on email confirmation instead
        const token = await User.accessTokens.create(user)

        return response.created({
            user: user.serialize(),
            token: token.value,
        })
    }
}