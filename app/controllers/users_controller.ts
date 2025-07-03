import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, updateUserValidator } from '#validators/user'

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

        return response.created(user.serialize())
    }

    /**
     * @me
     * @summary Get current user profile
     * @tag User
     * @responseBody 200 - <User> - Current user profile
     */
    async me({ auth, response }: HttpContext) {
        const user = auth.user!
        return response.ok(user.serialize())
    }

    /**
     * @update
     * @summary Update current user profile
     * @tag User
     * @requestBody <updateUserValidator>
     * @responseBody 200 - <User> - Updated user profile
     */
    async update({ request, auth, response }: HttpContext) {
        const data = request.only(['fullName', 'email', 'password'])
        const payload = await updateUserValidator.validate(data)

        delete payload.password

        const user = auth.user!

        user.merge(payload)
        await user.save()

        return response.ok(user.serialize())
    }
}