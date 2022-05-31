const nodeFileSys = require("fs").promises;
const nodePathModule = require("path");
const { v4: uuidv4 } = require('uuid');

const contactsPath = nodePathModule.resolve("./models/contacts.json");

async function listContacts() {
  try {
    const contactsRaw = await nodeFileSys.readFile(contactsPath, { encoding: "utf-8" });
    const contacts = JSON.parse(contactsRaw);
    return contacts;
  }
  catch (error) {
    console.error(error);
    return undefined;
  };
}

async function getContactById(contactId) {
  const contacts = await listContacts();

  if (!contacts || !contacts.length || contacts.length === 0) {
    return false; //no contacts, search fails
  }

  const idString = contactId.toString();
  
  const foundContact = contacts.find((contact) => {
    return contact.id === idString;
  });
  
  if (foundContact) {
    return foundContact; //gotcha
  }
  else {
    return false;
  }
}

async function removeContact(contactId) {
  //contactId should be a String
  const contacts = await listContacts();

  if (!contacts || contacts.length === 0) {
    return false; //no contacts, deletion failed
  }

  const idString = contactId.toString();

  const contactForDeletion = contacts.find((contact) => contact.id === idString);

  if (!contactForDeletion) {
    return false; //no contact found to delete
  }

  const contactsAfterDeletion = contacts.filter((contact) => {
    return contact.id !== idString; //keep all contacts with IDs != delID
  });

  try {
    await nodeFileSys.writeFile(contactsPath, JSON.stringify(contactsAfterDeletion, null, 2), "utf-8");
  }
  catch (error) {
    //this branch triggers when writeFile promise is rejected
    return 500;
  }

  return contactForDeletion; //deletion successful, returning deleted contact
}

async function addContact(body) {
  const contacts = await listContacts();

  if (!contacts || !contacts.length) {
    contacts = [];
  }
  const contactWithId = { id: uuidv4(), ...body };
  contacts.push(contactWithId);
  try {
    await nodeFileSys.writeFile(contactsPath, JSON.stringify(contacts, null, 2), "utf-8");
  }
  catch (error) {
    //this branch triggers when writeFile promise is rejected
    return 500;
  }

  return contactWithId; //return new contact with id
}

async function updateContact(contactId, body) {
  const contacts = await listContacts();

  if (!contacts || contacts.length === 0) {
    return false; //no contacts, nothing to edit
  }

  const idString = contactId.toString();

  const updateIndex = contacts.findIndex((contact) => contact.id === idString);
  if (updateIndex < 0) {
    return false; //contact not found
  }

  const prevContact = contacts[updateIndex];

  contacts[updateIndex] = { ...prevContact, ...body };
  //allow for incomplete "updating" objects, overwriting only some properties. The rest stays the same

  const nextContact = contacts[updateIndex];

  nodeFileSys.writeFile(contactsPath, JSON.stringify(contacts, null, 2), "utf-8");

  return nextContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}