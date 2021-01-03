require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

const Person = require('./modules/person')

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
  const person = req.body
  const personString = JSON.stringify(person)

  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    personString === '{}' ? '' : personString,
  ].join(' ')
}))
app.use(errorHandler)

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(fetchedPersons => {
    res.json(fetchedPersons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON())
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const personObj = req.body

  const person = new Person({
    name: personObj.name,
    number: personObj.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(res => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/api/info', (req, res, next) => {
  Person.countDocuments({})
    .then(personsNum => {
      const info = `Phonebook has info for ${personsNum} people <br/>`
      const date = new Date
      res.send(info + date)
    })
    .catch(error => next(error))
})
app.get('/health', (req, res) => {
  res.send('ok')
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})