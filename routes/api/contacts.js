const express = require('express');

const ContactsError = require("./ContactsError.js");

//import { listContacts } from '../../models/contacts';
const contactOps = require('../../models/contacts')

const router = express.Router()

// endpoint: /api/contacts

router.get('/', async (req, res, next) => {
  try {
    const contacts = await contactOps.listContacts();
  }
  catch (error) {
    next(error);
    return;
  }
  
  res.status(200).json({
    code: 200,
    message: "Success",
    data: contacts,
  });
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params; 
  try {
    const foundContact = await contactOps.getContactById(contactId);
    if (foundContact === false) {
    //this is a clear error: if the user has a valid ID, there should be a result. Unless the ID is (already) invalid. In which case...
      throw new ContactsError(404, `Contact with id=${contactId} not found`)
    }
  }
  catch (error) {
    next(error);
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
  try {
    const addedContact = await contactOps.addContact(req.body);
  
    if (addedContact === 500) {
      //we failed to add contact due to writeFile error
      throw new ContactsError();
    }
  }
  catch (error) {
    next(error);
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
  try {
    const deletedContact = await contactOps.removeContact(contactId);
  
    if (deletedContact === false) {
      throw new ContactsError(404, `Contact with id=${contactId} not found`);
    }
    if(deletedContact === 500) {
      throw new ContactsError();
    }

  }
  catch (error) {
    next(error);
    return;
  }

  res.status(200).json({
    code: 200,
    message: "Contact deleted",
    data: deletedContact,
  });
})

router.put('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  //TODO: validate req.body for proper contact data
  try {
    const updatedContact = await contactOps.updateContact(contactId, req.body);
  
    if (updatedContact === false) {
      throw new ContactsError(404, `Contact with id=${contactId} not found`);
    }
  }
  catch (error) {
    next(error);
    return;
  }

  res.status(200).json({
    code: 200,
    message: "Contact updated",
    data: updatedContact,
  });
});

module.exports = router;
