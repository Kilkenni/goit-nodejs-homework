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

A new user begins with a email that is not verified. An email with verification token (link) is sent on the mailbox provided during registration.

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

#### GET /verify/:verificationToken

This endpoint verifies the email of a newly registered user. The link the user received can be used only once.

On successful verification the user can log in and use the account.

On **success** returns `200` + JSON:

    {
      message: "Verification successful",
    }

---

#### POST /verify

Re-sends the letter with verification token (used to confirm email address). Email should be present in the database (i.e. the user should have passed the registration).

Requires JSON body:

    {
      email
    }

On **success** returns `200` + JSON:

    {
      message: "Verification email sent",
    }

---

#### POST /login

Logins a user, returning user info and an expirable JWT token. A user with non-verified email gets an error instead.

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

#### PATCH /avatars

A fresh user gets a randomly assigned Gravatar based on the email used during registration. This endpoint can be used to set a custom one.

The file uploaded should satisfy the conditions:

- JPG or PNG
- max size of 1 Mb
- preferably at least 250px (auto-scaled to this size on upload)

Requires HTTP header:

    Authorization: Bearer <valid JWT token>

Requires JSON body (multipart/form-data):

    {
      avatar: JPG or PNG, max size of 1 Mb
    }

On **success** returns `200`+ JSON:

    {
      avatarURL
    }

---

---

### /api/contacts

**All** HTTP methods on contacts require the following HTTP header (in addition to their specific requirements):

    Authorization: Bearer <valid JWT token>

On **unauthorized access** (i.e. a user tries to get/edit/delete contactId that he does not own) a **404** error ("Not found") is returned.2

---

#### GET /

This request supports query parameters:

Pagination in the format of `page=1&limit=20`. `page` and `limit` are mutually optional, in any order.

- `limit` defaults to 20, accepts only positive integers (other values are ignored)
- `page` defaults to 1, accepts only positive integers (other values are ignored)
- If requested page contains no entries (contacts out of bounds), contacts will be an empty array

Filter by favorite field in the format of `favorite=true|false`.

- `favorite` accepts only booleans (true or false), lowercase (other values are ignored)

On **success** returns `200`+ JSON with this _data_ field:

    {
      contacts:[{}, {}, ...],
      total: <total number of contacts for this user>
      [page]: <requested page>
    }

Note that `total` includes _filtered_ results (i.e. if `favorite` is set, only corresponding entries wil be counted).

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
