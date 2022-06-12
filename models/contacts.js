const { Contact } = require("./contactSchema.js");
const { ServerError, NotFoundError } = require("../errors/ServerError")

async function listContacts() {
  try {
    const contacts = await Contact.find();
    return contacts;
  }
  catch (mongooseError) {
    throw new ServerError();
  };
}

async function getContactById(contactId) {
  try {
    const foundContact = await Contact.findById(contactId.toString());
    return foundContact || null;
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found`);
  } 
}

async function removeContact(contactId) {
  //contactId should be a String
  try {
    const contactForDeletion = await Contact.findOneAndDelete({ _id: contactId })
    return contactForDeletion || null; //returning deleted contact, or null if it is not found
  }
  catch (mongooseError) {
    //can be an ID cast error, it's presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found. Invalid id?`);
  }
}

async function addContact(body) {
  try {
    const localBody = { ...body };
    if (!localBody.favorite) {
      localBody.favorite = false; //default
    }
    const contactWithId = await Contact.create(localBody);

    return contactWithId; //return new contact with id 
  }
  catch (mongooseError) {
    throw new ServerError();
  }
}

async function updateContact(contactId, body) {
  try {
    const nextContact = await Contact.findOneAndUpdate({ _id: contactId }, body, { returnDocument: "after" });

    return nextContact || null; //update returns null if the contact is not found, hence we return "null"
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found. Invalid id?`);
  } 
}

async function updateStatusContact(contactId, body) {
  try {
    const { favorite } = body;
    const nextContact = await Contact.findByIdAndUpdate(contactId, {favorite}, { new: true });

    return nextContact || null; //update returns null if the contact is not found, hence we return "null"
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found. Invalid id?`);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
}