const express = require('express');

const router = express.Router();

const contactOps = require('../../models/contacts');
const { ServerError, NotFoundError } = require("../../errors/ServerError.js");

//for checking req.body with Joi
const { contactValSchema, contactValSchemaFav } = require("../../models/contactSchema.js");
const validateSchema = require("../../validation/validateSchema.js");
// const contactFavSchema = require('../../validation/contactFavSchema.js');

// endpoint: /api/contacts

router.get('/', async (req, res, next) => {
  try {
    const contacts = await contactOps.listContacts();

    res.status(200).json({
      code: 200,
      message: "Success",
      data: contacts,
    });
  }
  catch (error) {
    next(error);
    return;
  }
})

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params; 
  try {
    const foundContact = await contactOps.getContactById(contactId);
    if (!foundContact) {
      //clear error: if the user has a valid ID, there should be a result. Unless the ID is (already) invalid. In which case...
      throw new NotFoundError(`Contact with id=${contactId} not found`);
    }

    res.status(200).json({
      code: 200,
      message: "Success",
      data: foundContact,
    });
  }
  catch (error) {
    next(error);
    return;
  }
})

router.post('/', validateSchema(contactValSchema), async (req, res, next) => {
  try {
    const addedContact = await contactOps.addContact(req.body);

    res.status(201).json({
      code: 201,
      message: "Success",
      data: addedContact,
    })
  }
  catch (error) {
    next(error);
    return;
  }
})

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params; 
  try {
    const deletedContact = await contactOps.removeContact(contactId);
  
    if (!deletedContact) {
      throw new NotFoundError(`Contact with id=${contactId} not found`);
    }

    res.status(200).json({
      code: 200,
      message: "Contact deleted",
      data: deletedContact,
    });
  }
  catch (error) {
    next(error);
    return;
  }
})

router.put('/:contactId', validateSchema(contactValSchema), async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const updatedContact = await contactOps.updateContact(contactId, req.body);
  
    if (!updatedContact) {
      throw new NotFoundError(`Contact with id=${contactId} not found`);
    }

    res.status(200).json({
      code: 200,
      message: "Contact updated",
      data: updatedContact,
    });
  }
  catch (error) {
    next(error);
    return;
  } 
});

router.patch("/:contactId/favorite", validateSchema(contactValSchemaFav), async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const updatedContact = await contactOps.updateStatusContact(contactId, req.body);
  
    if (!updatedContact) {
      throw new NotFoundError(`Contact with id=${contactId} not found`);
    }

    res.status(200).json({
      code: 200,
      message: "Contact updated",
      data: updatedContact,
    });
  }
  catch (error) {
    next(error);
    return;
  }
});

module.exports = router;