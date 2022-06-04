//const nodeFileSys = require("fs").promises;
//const nodePathModule = require("path");
//const { v4: uuidv4 } = require('uuid');

//const contactsPath = nodePathModule.resolve("./models/contacts.json");

const Contact = require("./contactSchema.js");

async function listContacts() {
  try {
    const contacts = await Contact.find();
    return contacts;
  }
  catch (error) {
    console.error(error);
    return undefined;
  };
}

async function getContactById(contactId) {
  try {
    const foundContact = await Contact.findById(contactId.toString());
    return foundContact || false;
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    return false;
  } 
}

async function removeContact(contactId) {
  //contactId should be a String
  try {
    const contactForDeletion = await Contact.findOneAndDelete({ _id: contactId })
    return contactForDeletion || false; //returning deleted contact, or false if it is null
  }
  catch (mongooseError) {
    //can be an ID cast error, it's presented as 404 to the user
    return false;
  }
}

async function addContact(body) {
  try {
    const localBody = { ...body };
    if (!localBody.favorite) {
      localBody.favorite = false;
    }
    const contactWithId = await Contact.create(localBody);

    return contactWithId; //return new contact with id 
  }
  catch (mongooseError) {
    return 500;
  }
}

async function updateContact(contactId, body) {
  try {
    const nextContact = await Contact.findOneAndUpdate({ _id: contactId }, body, { returnDocument: "after" });

    return nextContact || false; //update returns null if the contact is not found, hence we return "false"
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    return false;
  } 
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}