const express = require('express');
const app = express()
var morgan = require('morgan')
const cors = require('cors')

app.use(cors())
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
    personString === "{}" ? "" : personString,
  ].join(' ')
}))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123489",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	const person = persons.find(person => person.id === id)

	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}
})

const contactValid = (person) => {
	if (!person.name) {
		return 1
	} else if (!person.number) {
		return 2
	} else if (persons.find(existing => existing.name === person.name)) {
		return 3
	} else {
		return 0
	}
}

app.post('/api/persons', (req, res) => {
  const person = req.body
  const personObj = {...person, "id": Math.floor(Math.random() * 10000)}

  const validCode = contactValid(personObj)

  if (validCode === 1) {
    return res.status(400).json({ 
      error: 'Person name missing' 
    })
  } else if (validCode === 2) {
    return res.status(400).json({ 
      error: 'Person number missing' 
    })
  } else if (validCode === 3) {
    return res.status(400).json({ 
      error: 'Another person with the same name already exists' 
    })
  } else {
 	  persons = persons.concat(personObj)
	  res.json(personObj)
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.get('/api/info', (req, res) => {
	const info = `Phonebook has info for ${persons.length} people <br/>`
	const date = new Date
  res.send(info + date)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})