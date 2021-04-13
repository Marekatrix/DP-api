'use strict'

const Database = use('Database')
const Sentence = use('App/Models/Sentence')

const dictionary = require('../../../public/dictionary.json')

class SentenceController {
  async show({ params, response }) {
    const sentence = await Sentence.find(params.sentence_id)
    return response.json({
      status: 'success',
      data: sentence
    })
  }

  async getSentenceWithDict({ response, params }) {
    const sentence = (await Sentence.find(params.sentence_id))
    const text = sentence.text.toLowerCase()

    const foundWords = Object.keys(dictionary).reduce((words, word) => {
      if (text.includes(word)) words.push(word)
      return words
    }, [])

    const matchedDictionary = foundWords.reduce((dict, word) => {
      return { ...dict, [word]: dictionary[word] }
    }, {})

    return response.json({
      sentence: {
        id: sentence.id,
        text: text
      },
      dictionary: matchedDictionary
    })
  }

  async getRandomSentence({ request, response }) {
    const query = request.get()
    const idsString = query.forbiddenIds 
      ? query.forbiddenIds.replace('[', '(').replace(']', ')')
      : ''

    let randomSentence = await Database
      .raw(`
        SELECT * FROM (
          SELECT X.text, X.snt_id as id, X.ans_count as count FROM (
            SELECT COUNT(answ.sentence_id) as ans_count, snt.text, snt.id as snt_id FROM (
              SELECT * FROM sentences
              ${idsString ? `EXCEPT SELECT * FROM sentences WHERE id IN ${idsString}` : ''}
            ) as snt
            LEFT JOIN answers AS answ ON snt.id = answ.sentence_id
            GROUP BY answ.sentence_id, snt.text, snt.id
            ORDER BY ans_count DESC
          ) as X
          WHERE X.ans_count < 5
          LIMIT 10
        ) as X
        ORDER BY random()
        LIMIT 1
      `)

    // if all sentences were used, ignore exception
    if (!randomSentence.rows.length) {
      randomSentence = (await Database
        .raw(`
          SELECT *
          FROM sentences
          ORDER BY random()
          LIMIT 1;
        `)
      )
    }

    response.json(randomSentence.rows[0])
  }

  async getRandomSentenceWithReplacedWords({ request, response }) {
    const sentence = (await Database
      .raw(`
        SELECT *
        FROM sentences
        WHERE eligible
        ORDER BY random()
        LIMIT 1;
      `)
    ).rows[0]
    const text = sentence.text.toLowerCase()

    const foundWords = Object.keys(dictionary).reduce((words, word) => {
      if (text.includes(word)) words.push(word)
      return words
    }, [])

    const matchedDictionary = foundWords.reduce((dict, word) => {
      return { ...dict, [word]: dictionary[word] }
    }, {})

    return response.json({
      sentence: {
        id: sentence.id,
        text: text
      },
      dictionary: matchedDictionary
    })
  }

  async create({ request, auth, response }) {
    try {
      await auth.check()
    } catch (error) {
      return response.status(403).json({
        status: 'error',
        message: 'Unauthorized.'
      })
    }

    const sentenceData = request.only(['text', 'eligible'])
    const sentence = await Database.table('sentences').where('text', sentenceData.text)

    if (sentence.length) {
      return response.status(422).json({
        status: 'error',
        message: 'This sentence has been already created.'
      })
    }

    try {
      const user = await auth.getUser()
      const sentence = await Sentence.create({ ...sentenceData, user_id: user.id })
      return response.json({
        status: 'success',
        data: sentence
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the sentence, please try again later.'
      })
    }
  }

}

module.exports = SentenceController
