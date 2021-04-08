'use strict'

const Answer = use('App/Models/Answer')

class AnswerController {

  async create({ request, response, params, auth }) {
    try {
      await auth.check()
    } catch (error) {
      return response.status(403).json({
        status: 'error',
        message: 'Unauthorized.'
      })
    }

    const answerData = await request.only(['clickbait', 'credibility'])
    try {
      const user = await auth.getUser()
      const answer = await Answer.create({ ...answerData, sentence_id: params.sentence_id, user_id: user.id })
      return response.json({
        status: 'success',
        data: answer
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the sentence, please try again later.'
      })
    }

  }

}

module.exports = AnswerController
