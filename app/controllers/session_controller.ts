import User from "#models/user"
import { createSessionValidator } from "#validators/session"
import { HttpContext } from "@adonisjs/core/http"

export default class SessionController {
    /**
     * @store
     * @summary Logs in a user
     * @tag Auth
     * @requestBody <createSessionValidator>
     * @responseBody 200 - <Token> - Authentication token
     */
    async store({ request, auth }: HttpContext) {
        const data = request.only(['email', 'password'])
        const { email, password } = await createSessionValidator.validate(data)
        const user = await User.verifyCredentials(email, password)

        return await auth.use('api').createToken(user)
    }

    /**
     * @destroy
     * @summary Logs out a user
     * @tag Auth
     * @responseBody 204 - Logout successful
     */
    async destroy({ auth }: HttpContext) {
        await auth.use('api').invalidateToken()
    }
}