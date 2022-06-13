# GoIT Node.js backend practice

- Core: Node + Express
- DB: MongoDB via Mongoose
- Authorization via JWT tokens
- JSON validation via Joi
- Storing passwords: hashes only via bcrypt.js, salty
- Some JSDoc for practicing in-code JS documentation

Limitation on JST tokens: token expiration in this implementation is ignored but each user can have only _one_ valid token at a time (matching the one stored in the DB). Note that this is a deliberate (naive) way to simulate a state of "login" server-side; JWT is stateless by design, so normally this is not the case.

Responds with corresponding errors if data provided for HTTP methods is flawed (invalid token, missing body parts etc).

## endpoints

### /api/users

---

#### POST /signup

Registers a new user. Reusing emails is not allowed. Subscription is optional, defaults to "starter"

Requires JSON body:

    {
      email: unique
      password: up to 55 bytes, mind Unicode!
      [subscription]: "starter" (default) |"pro"|"business"
    }

On **success** returns `201` + JSON:

    {
      user: {
        email
        subscription
      }
    }

---

#### POST /login

Logins a user, returning user info and an expirable JWT token.

Requires JSON body:

    {
      email
      password
    }

On **success** returns `200` + JSON:

    {
      token
      user: {
        email
        subscription
      }
    }

---

#### GET /logout

Resets the token currently assigned to the user in the DB.

Requires HTTP header:

    Authorization: Bearer <valid JWT token>

On **success** returns `204`, no JSON.

---

#### GET /current

Requires HTTP header:

    Authorization: Bearer <valid JWT token>

On **success** returns `200`+ JSON:

    {
      email
      subscription
    }

---

#### PATCH /

Updates subscription for the user.

Requires HTTP header:

    Authorization: Bearer <valid JWT token>

Requires JSON body:

    {
      subscription: "starter" |"pro"|"business"
    }

On **success** returns `200`+ JSON:

    {
      email
      subscription
    }

---

---

### /api/contacts

**All** HTTP methods on contacts require the following HTTP header (in addition to their specific requirements):

    Authorization: Bearer <valid JWT token>

On **unauthorized access** (i.e. a user tries to get/edit/delete contactId that he does not own) a **404** error ("Not found") is returned.

#### GET /

On **success** returns `200`+ JSON with this _data_ field:

    {
      contacts:[{}, {}, ...],
      total: <total number of contacts for this user>
    }

---

#### GET /:contactId

On **success** returns `200`+ JSON with _data_ field containing contact with `_id=contactId`:

    {
      _id
      name
      email
      phone
      favorite
    }

---

#### POST /

Requires JSON body:

    {
      name: string
      email: string
      phone: string
      [favorite]: true|false
    }

On **success** returns `201`+ JSON with _data_ field containing newly created contact with `_id=contactId`:

    {
      _id
      name
      email
      phone
      favorite
    }

---

#### DELETE /:contactId

On **success** returns `200`+ JSON with _data_ field containing deleted contact with `_id=contactId`:

    {
      _id
      name
      email
      phone
      favorite
    }

---

#### PUT /:contactId

Requires JSON body:

    {
      name: string
      email: string
      phone: string
      [favorite]: true|false
    }

On **success** returns `200`+ JSON with _data_ field containing updated contact with `_id=contactId`:

    {
      _id
      name
      email
      phone
      favorite
    }

---

#### PATCH /:contactId/favorite

Requires JSON body:

    {
      favorite: true|false
    }

On **success** returns `200`+ JSON with _data_ field containing updated contact with `_id=contactId`:

    {
      _id
      name
      email
      phone
      favorite
    }

---
