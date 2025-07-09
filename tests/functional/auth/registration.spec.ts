import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User Registration', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should register a new user with valid data', async ({ client, assert }) => {
    const userData = {
      fullName: 'John Doe',
      email: 'john.doe.1@example.com',
      password: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(201)

    const responseBody = response.body()
    assert.exists(responseBody.id)
    assert.equal(responseBody.email, userData.email)
    assert.equal(responseBody.fullName, userData.fullName)
    assert.isUndefined(responseBody.password, 'Password should not be included in response')
    assert.exists(responseBody.createdAt)
    assert.exists(responseBody.updatedAt)

    // Verify user was created in database
    const user = await User.findBy('email', userData.email)
    assert.isNotNull(user)
    assert.equal(user!.email, userData.email)
    assert.equal(user!.fullName, userData.fullName)
    assert.isTrue(user!.id.length > 0, 'User should have a UUID')
  })

  test('should register a user without full name', async ({ client, assert }) => {
    const userData = {
      email: 'jane.doe.2@example.com',
      password: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(201)

    const responseBody = response.body()
    assert.exists(responseBody.id)
    assert.equal(responseBody.email, userData.email)
    assert.isUndefined(responseBody.fullName)
    assert.isUndefined(responseBody.password)
  })

  test('should fail with invalid email format', async ({ client }) => {
    const userData = {
      fullName: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail with empty email', async ({ client }) => {
    const userData = {
      fullName: 'John Doe',
      email: '',
      password: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail with missing password', async ({ client }) => {
    const userData = {
      fullName: 'John Doe',
      email: 'john.doe.3@example.com',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail with empty password', async ({ client }) => {
    const userData = {
      fullName: 'John Doe',
      email: 'john.doe.4@example.com',
      password: '',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail with duplicate email', async ({ client, assert }) => {
    const userData = {
      fullName: 'John Doe',
      email: 'duplicate.test@example.com',
      password: 'password123',
    }

    // First registration should succeed
    const firstResponse = await client.post('/api/auth/register').json(userData)

    firstResponse.assertStatus(201)

    // Second registration with same email should fail
    const secondResponse = await client.post('/api/auth/register').json(userData)

    secondResponse.assertStatus(422)
  })

  test('should hash password before storing', async ({ client, assert }) => {
    const userData = {
      fullName: 'John Doe',
      email: 'hash.test@example.com',
      password: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)

    console.debug(response.body())
    response.assertStatus(201)

    // Verify password is hashed in database
    const user = await User.findBy('email', userData.email)
    assert.isNotNull(user)
    assert.notEqual(user!.password, userData.password, 'Password should be hashed')
    assert.isTrue(user!.password.length > 50, 'Hashed password should be long')
  })
})
