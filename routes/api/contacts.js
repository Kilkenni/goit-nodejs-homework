const express = require('express')

//import { listContacts } from '../../models/contacts';
const contactOps = require('../../models/contacts')

const router = express.Router()

// endpoint: /api/contacts

router.get('/', async (req, res, next) => {
  const contacts = await contactOps.listContacts();

  res.status(200).json({
    code: 200,
    message: "Success",
    data: contacts,
  });
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params; 
  const foundContact = await contactOps.getContactById(contactId);
  
  if (foundContact === false) {
    //this is a clear error: if the user has a valid ID, there should be a result. Unless the ID is (already) invalid. In which case...
    res.status(404).json({
      code: 404,
      message: `Contact with id=${contactId} not found`,
    });
    return;
  }

  res.status(200).json({
    code: 200,
    message: "Success",
    data: foundContact,
  });
})

router.post('/', async (req, res, next) => {
  //TODO: validate contact
  const addedContact = await contactOps.addContact(req.body);
  
  if (addedContact === false) {
    //we failed to add contact due to writeFile error
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
    return;
  }

  res.status(201).json({
    code: 201,
    message: "Success",
    data: addedContact,
  })
})

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params; 
  const deletedContact = await contactOps.removeContact(contactId);
  
  if (deletedContact === false) {
    res.status(404).json({
      code: 404,
      message: `Contact with id=${contactId} not found`,
    });
    return;
  }
  if(deletedContact === 500) {
    res.status(500).json({
      code: 500,
      message: `Internal server error`,
    });
    return;
  }

  res.status(200).json({
    code: 200,
    message: "Contact deleted",
    data: deletedContact,
  });
})

router.put('/:contactId', async (req, res, next) => {
  res.json({ message: 'template message' })
})

module.exports = router;
