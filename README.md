# IdeaRiver Services Server

A robust Node.js library for building scalable backend services with a focus on security, modularity, and extensibility. It provides a comprehensive solution for handling CRUD operations, authentication, and middleware management, built on top of Express and TypeORM.

## Features

- **Abstracted CRUD Operations**: Simplifies the implementation of Create, Read, Update, Delete (CRUD) functionalities.
- **OpenID Connect Authentication**: Seamlessly integrates with Keycloak for secure authentication and authorization.
- **Middleware Support**: Offers customizable pre- and post-processing through middleware.
- **Security Enhancements**: Includes rate limiting, Helmet for security headers, and CSRF protection.
- **Database Support**: Works out of the box with PostgreSQL and SQLite databases.
- **Extensive Test Coverage**: Comes with Jest and Supertest tests to ensure reliability.

## Installation

Install the library via npm:

```bash
npm install ideariver.services.server
```

## Configuration

To use the library, create a .env file in your project root:

```bash
env
Copy code
KEYCLOAK_CLIENT_ID=my-client
KEYCLOAK_CLIENT_SECRET=my-client-secret
KEYCLOAK_REALM=MyRealm
KEYCLOAK_SERVER=http://localhost:8080/realms/MyRealm/.well-known/openid-configuration
PORT=3000
APP_ENV=dev
SSL_EN=false
CORS_EN=false
CSURF_EN=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Usage

Import and set up the library in your project:

```typescript
import { OpenID } from "ideariver.services.server";
import express from "express";

const app = express();
const openIDService = new OpenID();

app.use(express.json());

app.get("/protected", openIDService.authorize, (req, res) => {
  res.json({ message: "Protected route accessed" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

## Building Your Project

To compile your TypeScript code:

```bash

npm run build
```

## Running Tests

Execute tests using Jest:

```bash
npm run test
```

## API Documentation

### OpenID Class

The OpenID class provides methods to integrate with Keycloak for handling authentication.

### Methods

- init(): Initializes the Keycloak client.
- authorize(req, res, next): Middleware to protect routes using JWTs.
- getKeycloakToken(username, password, scopes): Retrieves an access token from Keycloak.
- refreshToken(refreshToken): Refreshes an existing access token.

#### AbstractCrudController Class

Provides a base class for implementing CRUD operations with customizable middleware.

Usage Example

```typescript
Copy code
import { AbstractCrudController } from 'ideariver.services.server';
import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';

@Entity()
class MyEntity {
@PrimaryGeneratedColumn('uuid')
id!: string;

@Column()
name!: string;
}

class MyEntityController extends AbstractCrudController<MyEntity> {
constructor(repository: Repository<MyEntity>) {
super(repository);
}
}
```

## AbstractValidator Class

A base class for validating requests using class-validator and class-transformer.

### Usage Example

```typescript
Copy code
import { AbstractValidator } from 'ideariver.services.server';
import { IsString } from 'class-validator';

class MyEntity {
@IsString()
name!: string;
}

class MyEntityValidator extends AbstractValidator<MyEntity> {
constructor() {
super(MyEntity);
}
}
```

## Contributing

We welcome contributions! Please follow these steps:

- Fork the repository.
- Create a new branch (git checkout -b feature-branch).
- Make your changes.
- Commit your changes (git commit -m 'Add new feature').
- Push to the branch (git push origin feature-branch).
- Open a Pull Request.

## License

This project is licensed under the MIT License.
