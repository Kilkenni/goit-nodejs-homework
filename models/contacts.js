/**
 * Operations on the collection of contacts in MongoDB
 * @module contacts.js
 */

const { Contact } = require("./contactSchema.js");
const { ServerError, NotFoundError } = require("../errors/ServerError");

/**
 * Tries to cast a part of URL query into the certain type
 * @param {!string} parameter - original parameter from query
 * @param {("Boolean"|"Integer")} typeName - name of the type to cast parameter to
 * @returns {?*} parsed parameter (if valid) or null (if invalid)
 */
function parseQueryParamType(parameter, typeName) {
  switch (typeName) {
    case "Boolean":
      switch (parameter) { // "true"|"false" => Boolean
        case "true":
          return true;
        case "false":
          return false;
        default:
          return null;
      }
    case "Integer":
      return parseInt(parameter) || null; // Int OR null if NaN
    default:
      return null; //typeName not supported, ignoring parameter
  }
}

/**
 * Tries to convert parameters from URL query to JS data types
 * @param {!Object} query - original URL query with strings
 * @returns {Object} query with properly typed params or {} if no params were typed successfully
 */
function parseQueryTypes(query) {
  if (Object.keys(query).length === 0) {
    return query;
  }
  const favorite = parseQueryParamType(query.favorite, "Boolean");
  const page = parseQueryParamType(query.page, "Integer");
  const limit = parseQueryParamType(query.limit, "Integer");

  //add only fields that are not null ("false" is valid), check validity
  const typedQuery = {
    ...(favorite !== null && {favorite}),
    ...((limit !== null && limit > 0) && { limit }),
    ...((page !== null && page > 0) && {page}), //page only makes sense if we set its size. If there is no "limit" , ignore it
  };  
  return typedQuery;
}

/**
 * Returns the contacts belonging to a certain user
 * @param {!string} ownerId 
 * @param {Object} queryParams - query params from path, parsed into corresponding data types
 * @param {number} [maxEntries=20] - maximum number of entries returned, defaults to 20
 * @returns { Object.<Object[], number> } contacts, total
 */
async function listContacts(ownerId, queryParams, maxEntries = 20) {
  try {
    const { favorite, limit, page } = parseQueryTypes(queryParams); 
    const validLimit = (limit && limit <= maxEntries) ? limit : maxEntries;
    const skip = validLimit * (page - 1) || 0;

    const total = await Contact.countDocuments({
        owner: ownerId,
        ...(favorite !== undefined && { favorite }),
    });
    const contacts = await Contact.find({
      owner: ownerId,
      ...(favorite !== undefined && {favorite})
    })
      .select(["-owner"])
      .limit(validLimit)
      .skip(skip);
    return { contacts, total, page };
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