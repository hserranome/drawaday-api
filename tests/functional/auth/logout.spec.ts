import { test } from '@japa/runner'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User Logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should logout successfully with valid token', async ({ client, assert }) => {
    // Create a user and login to get a token
    const user = await User.create({
      fullName: 'John Doe',
      email: 'logout.test.1@example.com',
      password: 'password123',
    })

    const loginResponse = await client.post('/api/auth/login').json({
      email: 'logout.test.1@example.com',
      password: 'password123',
    })

    const token = loginResponse.body().token

    // Now logout with the token
    const logoutResponse = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    logoutResponse.assertStatus(200)
  })

  test('should fail logout with invalid token', async ({ client }) => {
    const response = await client
      .delete('/api/auth/logout')
      .header('Authorization', 'Bearer invalid-token')

    response.assertStatus(401)
  })

  test('should fail logout with expired token', async ({ client }) => {
    const response = await client
      .delete('/api/auth/logout')
      .header('Authorization', 'Bearer oat_expired_token_here')

    response.assertStatus(401)
  })

  test('should fail logout without token', async ({ client }) => {
    const response = await client.delete('/api/auth/logout')

    response.assertStatus(401)
  })

  test('should fail logout with empty token', async ({ client }) => {
    const response = await client.delete('/api/auth/logout').header('Authorization', 'Bearer ')

    response.assertStatus(401)
  })

  test('should fail logout with malformed token', async ({ client }) => {
    const response = await client
      .delete('/api/auth/logout')
      .header('Authorization', 'InvalidFormat')

    response.assertStatus(401)
  })

  test('should invalidate token after logout', async ({ client, assert }) => {
    // Create a user and login to get a token
    const user = await User.create({
      fullName: 'John Doe',
      email: 'logout.test.2@example.com',
      password: 'password123',
    })

    const loginResponse = await client.post('/api/auth/login').json({
      email: 'logout.test.2@example.com',
      password: 'password123',
    })

    const token = loginResponse.body().token

    // Logout with the token
    const logoutResponse = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    logoutResponse.assertStatus(200)

    // Try to use the token again - should fail
    const secondLogoutResponse = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    secondLogoutResponse.assertStatus(401)
  })

  test('should handle multiple logout attempts with same token', async ({ client }) => {
    // Create a user and login to get a token
    const user = await User.create({
      fullName: 'John Doe',
      email: 'logout.test.3@example.com',
      password: 'password123',
    })

    const loginResponse = await client.post('/api/auth/login').json({
      email: 'logout.test.3@example.com',
      password: 'password123',
    })

    const token = loginResponse.body().token

    // First logout should succeed
    const firstLogoutResponse = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    firstLogoutResponse.assertStatus(200)

    // Second logout with same token should fail
    const secondLogoutResponse = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token}`)

    secondLogoutResponse.assertStatus(401)
  })

  test('should allow logout after multiple logins', async ({ client, assert }) => {
    // Create a user
    const user = await User.create({
      fullName: 'John Doe',
      email: 'logout.test.4@example.com',
      password: 'password123',
    })

    // Login multiple times to get multiple tokens
    const loginResponse1 = await client.post('/api/auth/login').json({
      email: 'logout.test.4@example.com',
      password: 'password123',
    })

    const loginResponse2 = await client.post('/api/auth/login').json({
      email: 'logout.test.4@example.com',
      password: 'password123',
    })

    const token1 = loginResponse1.body().token
    const token2 = loginResponse2.body().token

    // Both tokens should be different
    assert.notEqual(token1, token2)

    // Logout with first token
    const logoutResponse1 = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token1}`)

    logoutResponse1.assertStatus(200)

    // Second token should still work
    const logoutResponse2 = await client
      .delete('/api/auth/logout')
      .header('Authorization', `Bearer ${token2}`)

    logoutResponse2.assertStatus(200)
  })
})
