# Node.js + Express.js + MongoDB Authentication API

This project is meant to be used as a starting point for APIs that require user Authentication (registration and sign in).
All sign in sessions are directed to protected routes that pass through an authentication middleware.

The project uses ;

- Mongoose for data modelling.
- Express.js for server setup.
- randomtoken node.js module as authentication token
- bcrypt to hash passwords before storing in database

It API includes;

- User registration
- Login
- Password Reset
- Update user data
- Delete existing user admin priviledges) soon...

## Overview of auth system:

1. User registers account. Password is hashed and salted with bcrypt before being stored in the database.
2. User enters login credentials for login, server validates the credentials, if it's valid, it generates a random token.
   this token will be used along side every request post-login.
3. Token is sent in a json format after server response.
4. On every request post-login, client attaches the access token.
5. Protected endpoints send request through authentication middleware, which checks token received in request to exist in database.
6. On log out this access token will be deleted from the database and a new token will be required for next session.
7. Max life for access token is 12hrs if logout endpoint isn't called.
