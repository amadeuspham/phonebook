import React, { useState, useEffect } from 'react';
import phoneService from './services/phonebook';
import './App.css'

const Notification = ({ message, status }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={status}>
      {message}
    </div>
  )
}

const Person = ({person, handleRemove}) => {
  return (
    <p>
    {person.name}: {person.number} 
    <button onClick={() => handleRemove(person.id, person.name)}>remove</button>
    </p>
  );
}

const Persons = ({filtering, filteredContacts, persons, handleRemove}) => {
  return (
    <div>
      {filtering 
        ? filteredContacts.map(person => 
          <Person key={person.name} person={person} handleRemove={handleRemove}/>
        )
        : persons.map(person => 
          <Person key={person.name} person={person} handleRemove={handleRemove}/>
        )
      }
    </div>
  );
}

const FilterBar = ({filterStatus, setFilterStatus, filterByName}) => {
  const handleFilterChange = (event) => {
    if (event.target.value === '') {
      setFilterStatus({
        filterName: '',
        filtering: false,
      });
    } else {
      setFilterStatus({
        filterName: event.target.value,
        filtering: true,
      });
      filterByName(event.target.value);
    }
  }

  return (
    <div>
      <p>Filter by name: </p>
      <input value={filterStatus.filterName} onChange={handleFilterChange}/>
    </div>
  );
}

const PersonForm = (props) => {
  const {handleSubmit, newName, handleNameChange, newPhone, handlePhoneChange} = props;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        name: <input value={newName} onChange={handleNameChange}/>
      </div>
      <div>
        number: <input value={newPhone} onChange={handlePhoneChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
}

const App = () => {
  const [ persons, setPersons ] = useState([])
  const [ newName, setNewName ] = useState('')
  const [ newPhone, setNewPhone ] = useState('')
  const [ filterStatus, setFilterStatus ] = useState({
    filterName: '',
    filtering: false,
  })
  const [ filteredContacts, setFilteredContacts ] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    phoneService
      .getAll()
      .then(persons => setPersons(persons))
      .catch(err => {
        setErrorMessage(`Enable to fetch contacts`)
        setTimeout(() => {setErrorMessage(null)}, 5000)
      })
  }, [])

  const findExisting = (persons, checkPerson) => {
    return persons.find(person => person.name === checkPerson.name);
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const person = {
      name: newName,
      number: newPhone,
    }

    const existing = findExisting(persons, person)

    if (existing) {
      const willReplace = window.confirm(`${newName} already exists. Do you want to replace the current phone number?`);
      if (willReplace) {
        phoneService
          .update(existing.id, person)
          .then(newContact => {
            setPersons(persons.map(person => person.id !== existing.id ? person : newContact))
            setNewName('')
            setNewPhone('')
            setSuccessMessage(`Updated ${person.name}'s number`)
            setTimeout(() => {setSuccessMessage(null)}, 5000)
          })
          .catch(err => {
            setErrorMessage(`Info about ${person.name} was already removed`)
            setTimeout(() => {setErrorMessage(null)}, 5000)
            setNewName('')
            setNewPhone('')
            setPersons(persons.filter(remainingPerson => remainingPerson.name !== person.name))
          })
      } else {
        return;
      }
    } else {
      phoneService
        .create(person)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewPhone('')
          setSuccessMessage(`Added ${person.name}`)
          setTimeout(() => {setSuccessMessage(null)}, 5000)
        })
        .catch(err => {
          setErrorMessage(err.response.data)
          setTimeout(() => {setErrorMessage(null)}, 5000)
        })
    }
  }

  const filterByName = (nameInput) => {
    const filtered = persons.filter(person => person.name.toLowerCase().includes(nameInput.toLowerCase()))
    setFilteredContacts(filtered);
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  }

  const handlePhoneChange = (event) => {
    setNewPhone(event.target.value);
  }

  const handleRemove = (id, name) => {
    const willDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (willDelete) {
      phoneService
        .remove(id)
        .then(res => {
          setPersons(persons.filter(person => person.id !== id))
          setSuccessMessage(`Removed ${name}`)
          setTimeout(() => {setSuccessMessage(null)}, 5000)
        })
        .catch(err => {
          setErrorMessage(`Unable to delete ${name}`)
          setTimeout(() => {setErrorMessage(null)}, 5000)
        })
    } else {
      return;
    }
  }

  console.log(persons)

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} status='success'/>
      <Notification message={errorMessage} status='error'/>
      <FilterBar filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterByName={filterByName}/>
      <h2>Add a new contact</h2>
      <PersonForm 
        handleSubmit={handleSubmit} 
        newName={newName}
        handleNameChange={handleNameChange}
        newPhone={newPhone}
        handlePhoneChange={handlePhoneChange}
      />
      <h2>Numbers</h2>
      <Persons 
        filtering={filterStatus.filtering} 
        filteredContacts={filteredContacts} 
        persons={persons}
        handleRemove={handleRemove}
      />
    </div>
  )
}

export default App