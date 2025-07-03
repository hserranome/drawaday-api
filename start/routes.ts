/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from "adonis-autoswagger";
import swagger from "#config/swagger";
import { middleware } from './kernel.js';

const UsersController = () => import("#controllers/users_controller")
const SessionController = () => import("#controllers/session_controller")

router.get("/swagger", async () => {
  // returns swagger in YAML
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});

router.get("/docs", async () => {
  // Renders Swagger-UI and passes YAML-output of /swagger
  return AutoSwagger.default.scalar("/swagger");
});

router.get('/', async () => {
  return {
    status: 'ok'
  }
})

router
  .group(() => {
    router
      .group(() => {

        router.post('register', [UsersController, 'store'])
        router.post('login', [SessionController, 'store'])
        router.delete('logout', [SessionController, 'destroy'])
          .use(middleware.auth({ guards: ['api'] }))

      }).prefix('auth')
  })
  .prefix('api')