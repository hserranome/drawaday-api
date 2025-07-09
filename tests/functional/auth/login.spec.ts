import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User Login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should login with valid credentials', async ({ client, assert }) => {
    // Create a user first
    const user = await User.create({
      fullName: 'John Doe',
      email: 'login.test.1@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/auth/login').json({
      email: 'login.test.1@example.com',
      password: 'password123',
    })

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.token)
    assert.equal(responseBody.user.id, user.id)
    assert.equal(responseBody.user.email, user.email)
    assert.isUndefined(responseBody.user.password)
  })

  test('should fail with invalid email', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    response.assertStatus(400)
  })

  test('should fail with invalid password', async ({ client }) => {
    // Create a user first
    await User.create({
      fullName: 'John Doe',
      email: 'login.test.2@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/auth/login').json({
      email: 'login.test.2@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(400)
  })

  test('should fail with malformed email', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({
      email: 'invalid-email',
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should fail with empty email', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({
      email: '',
      password: 'password123',
    })

    response.assertStatus(422)
  })

  test('should fail with missing password', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({
      email: 'login.test.3@example.com',
    })

    response.assertStatus(422)
  })

  test('should fail with empty password', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({
      email: 'login.test.4@example.com',
      password: '',
    })

    response.assertStatus(422)
  })

  test('should return valid token format', async ({ client, assert }) => {
    // Create a user first
    await User.create({
      fullName: 'John Doe',
      email: 'login.test.5@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/auth/login').json({
      email: 'login.test.5@example.com',
      password: 'password123',
    })

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.token)
    assert.isString(responseBody.token)
    assert.isTrue(responseBody.token.startsWith('oat_'), 'Token should start with oat_ prefix')
  })

  test('should handle case insensitive email login', async ({ client, assert }) => {
    // Create a user with lowercase email
    const user = await User.create({
      fullName: 'John Doe',
      email: 'login.test.6@example.com',
      password: 'password123',
    })

    // Login with uppercase email
    const response = await client.post('/api/auth/login').json({
      email: 'LOGIN.TEST.6@EXAMPLE.COM',
      password: 'password123',
    })

    response.assertStatus(200)

    const responseBody = response.body()
    assert.exists(responseBody.token)
    assert.equal(responseBody.user.id, user.id)
    assert.equal(responseBody.user.email, user.email) // Should be normalized to lowercase
  })
})
