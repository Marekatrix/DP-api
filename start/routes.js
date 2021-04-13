'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

// auth routes
Route
  .get('users/:id', 'UserController.show')
  .middleware('auth')
Route.post('signup', 'UserController.signup')
Route.post('login', 'UserController.login')

// sentence routes
Route.post('sentence', 'SentenceController.create')
Route.get('sentence-with-dict/:sentence_id', 'SentenceController.getSentenceWithDict')
Route.post('sentence/:sentence_id/answer', 'AnswerController.create')
Route.get('sentence/:sentence_id', 'SentenceController.show')
Route.get('random-sentence', 'SentenceController.getRandomSentence')
Route.get('random-sentence-replaced', 'SentenceController.getRandomSentenceWithReplacedWords')

// user routes
Route.put('user/savescore', 'UserController.saveScore')
Route.get('users', 'UserController.index')