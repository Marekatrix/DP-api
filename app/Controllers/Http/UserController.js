'use strict'

const Database = use('Database')
const User = use('App/Models/User')

class UserController {
  async signup ({ request, auth, response }) {
    // get user data from signup form
    const userData = request.only(['username', 'email', 'password'])

    try {
      // save user to database
      const user = await User.create(userData)
      // generate JWT token for user
      const token = await auth.generate(user)
      return response.json({
        status: 'success',
        data: token
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the user, please try again later.'
      })
    }
  }

  async login ({ request, auth, response }) {
    const { email, password } = request.all()
    const user = await auth.attempt(email, password)

    return response.json({
      status: 'success',
      data: user.token
    })
  }

  async index ({ auth, response }) {
    try {
      await auth.check()
    } catch (error) {
      return response.status(403).json({
        status: 'error',
        message: 'Unauthorized.'
      })
    }

    let users = await Database
      .raw(`
        SELECT username, score FROM users
        WHERE score IS NOT NULL
        ORDER BY score DESC
      `)

    return response.json({
      status: 'success',
      data: users.rows
    })
  }

  async saveScore({ request, auth, response }) {
    const { score } = request.all()

    try {
      await auth.check()
    } catch (error) {
      return response.status(403).json({
        status: 'error',
        message: 'Unauthorized.'
      })
    }

    const user = await auth.getUser()

    await Database
      .table('users')
      .where('id', user.id)
      .update('score', score)

    return response.json({
      status: 'success',
      data: user
    })
  }
}

module.exports = UserController
