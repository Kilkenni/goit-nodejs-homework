/**
 * Operations on the collection of contacts in MongoDB
 * @module contacts.js
 */

const { Contact } = require("./contactSchema.js");
const { ServerError, NotFoundError } = require("../errors/ServerError");
const { NotAuthorizedError } = require("../errors/JwtError");

/**
 * Returns the contacts belonging to a certain user
 * @param {!string} ownerId 
 * @returns { Object } contacts, total
 */
async function listContacts(ownerId) {
  try {
    const total = await Contact.countDocuments({owner: ownerId});
    const contacts = await Contact.find({owner: ownerId}).select(["-owner"]);
    return { contacts, total };
  }
  catch (mongooseError) {
    throw new ServerError();
  };
}

/**
 * Returns a single contact
 * @param {!string} contactId 
 * @param {!string} ownerId 
 * @returns {?Object} found contact
 */
async function getContactById(contactId, ownerId) {
  try {
    const foundContact = await Contact.findOne({ _id: contactId, owner: ownerId }).select(["-owner"]);
    return foundContact || null;
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found`);
  } 
}

/**
 * Deletes contact from the DB
 * @param {!string} contactId 
 * @param {!string} ownerId
 * @returns {?Object} deleted contact
 */
async function removeContact(contactId, ownerId) {
  try {
    const contactForDeletion = await Contact.findOneAndDelete({ _id: contactId, owner: ownerId }).select(["-owner"]);
    return contactForDeletion || null; //returning deleted contact, or null if it is not found
  }
  catch (mongooseError) {
    //can be an ID cast error, it's presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found. Invalid id?`);
  }
}

/**
 * Adds new contact for current user
 * @param {!Object} body - includes owner
 * @returns {Object} new contact
 */
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

/**
 * Updates contact with new data (partially or entirely)
 * @param {!string} contactId 
 * @param {!string} ownerId
 * @param {!Object} body 
 * @returns {?Object} Updated contact
 */
async function updateContact(contactId, ownerId, body) {
  try {
    const nextContact = await Contact.findOneAndUpdate({ _id: contactId, owner: ownerId }, body, { returnDocument: "after" }).select(["-owner"]);

    return nextContact || null; //update returns null if the contact is not found, hence we return "null"
  }
  catch (mongooseError) {
    //can be an ID cast error (ID format is wrong), it's still presented as 404 to the user
    throw new NotFoundError(`Contact with id ${contactId} not found. Invalid id?`);
  } 
}

/**
 * Updates "favorite" status for contact
 * @param {!string} contactId 
 * @param {!string} ownerId
 * @param {!Object} body 
 * @returns {?Object} updated contact
 */
async function updateStatusContact(contactId, ownerId, body) {
  try {
    const { favorite } = body;
    const nextContact = await Contact.findOneAndUpdate({ _id: contactId, owner: ownerId }, {favorite}, { new: true }).select("-owner");

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