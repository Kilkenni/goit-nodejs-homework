# GoIT Node.js backend practice

- Core: Node + Express
- DB: MongoDB via Mongoose
- Authorization via JWT tokens
- JSON validation via Joi
- Storing passwords: hashes only via bcrypt.js, salty

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

On success returns `201` + JSON:

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

On success returns `200` + JSON:

    {
      token
      user: {
        email
        subscription
      }
    }

---

#### GET /logout

Resets the token currently assigned to the user in the DB. Does not invalidate it!

Requires HTTP header:

    Authorization: Bearer <valid JWT token>

On success returns `204`, no JSON.

---

#### GET /current

Requires HTTP header:

    Authorization: Bearer <valid JWT token>

On success returns `200`+ JSON:

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

On success returns `200`+ JSON:

    {
      email
      subscription
    }

---
