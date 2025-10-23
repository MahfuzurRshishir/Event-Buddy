# Event Buddy — Backend (NestJS)

Event Buddy Backend is a RESTful API built with NestJS for managing events, bookings, users, and authentication. It provides endpoints consumed by the Event Buddy Frontend and serves uploaded images as static assets.

## Key Features

- **Authentication**
  - JWT-based login and route protection (Passport + `passport-jwt`).
  - Role-based access for admin operations.

- **Events Management**
  - Create, update, delete, and fetch events.
  - Image upload and static serving under `/uploads`.

- **Bookings**
  - Create and cancel bookings.
  - Capacity-aware logic to ensure availability consistency.

- **Integration & Ops**
  - CORS enabled for local frontends (`http://localhost:3000`, `http://localhost:3001`).
  - PostgreSQL persistence via TypeORM.

## Technology Stack (Backend)

- **Framework**: NestJS `@nestjs/common@^11.0.1`, `@nestjs/core@^11.0.1`, `@nestjs/platform-express@^11.1.6`
- **Auth**: `@nestjs/jwt@^11.0.1`, `@nestjs/passport@^11.0.5`, `passport@^0.7.0`, `passport-jwt@^4.0.1`, `bcrypt@^6.0.0`
- **ORM & DB**: TypeORM `^0.3.27`, PostgreSQL driver `pg@^8.16.3`
- **Validation/Transform**: `class-validator@^0.14.2`, `class-transformer@^0.5.1`
- **Uploads/Mail**: `multer@^2.0.2`, `nodemailer@^7.0.9`
- **Tooling**: TypeScript `^5.7.3`, Jest `^30.0.0`, ESLint/Prettier

## Folder Structure

```
└── 📁src
    └── 📁auth
        └── 📁dto
            ├── createUser.dto.ts
            ├── login.dto.ts
        ├── auth.controller.spec.ts
        ├── auth.controller.ts
        ├── auth.module.ts
        ├── auth.service.spec.ts
        ├── auth.service.ts
        ├── jwt-auth.guard.ts
        ├── jwt-blacklist.service.ts
        ├── jwt.strategy.ts
        ├── roles.decorator.ts
        ├── roles.guard.ts
    └── 📁bookings
        └── 📁dto
            ├── book-seats.dto.ts
            ├── booking-query.dto.ts
        ├── bookings.controller.ts
        ├── bookings.entity.ts
        ├── bookings.module.ts
        ├── bookings.service.ts
    └── 📁events
        └── 📁dto
            ├── create-event.dto.ts
            ├── event-query.dto.ts
            ├── update-event.dto.ts
        └── 📁events-pictures
            ├── 628ddb79cbd3f51f4c84b29281d87e9b
        ├── events.controller.ts
        ├── events.entity.ts
        ├── events.module.ts
        ├── events.reg.entity.ts
        ├── events.service.ts
    └── 📁users
        ├── users.controller.ts
        ├── users.entity.ts
        ├── users.module.ts
        ├── users.service.ts
    ├── app.controller.spec.ts
    ├── app.controller.ts
    ├── app.module.ts
    ├── app.service.ts
    └── main.ts
    |
    |📁Postman
    ├── EventBuddy.postman_collection.json
        
    |📁uploads
    
```

## Environment Configuration

- **PORT**: API port, defaults to `3007` (see `src/main.ts`).
- **Database config**: Set via TypeORM configuration (commonly `DATABASE_URL` or discrete vars like `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- **CORS**: Frontend origins allowed: `http://localhost:3000`, `http://localhost:3001`.

Example `.env` (adjust to your environment):

```env
DATABASE_URL=postgres://username:password@localhost:5432/eventbuddy
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=3600s
process.env.JWT_SECRET='supersecretkey'


# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=yourdbusername
DB_PASSWORD=yourpass
DB_NAME=eventbuddy

PORT=3005
```

## Setup & Run

- **Prerequisites**
  - Node.js `>= 18` (LTS recommended)
  - PostgreSQL running locally or accessible remotely

- **Install dependencies**
  - `npm install`

- **Run in development**
  - `npm run start:dev`
  - API default: `http://localhost:3007`

- **Build for production**
  - `npm run build`

- **Start production server**
  - `npm run start:prod`

- **Lint & Test**
  - Lint: `npm run lint`
  - Test: `npm test`
  - Coverage: `npm run test:cov`

## API Endpoints

Base URL: `http://localhost:${PORT || 3007}`

### Auth (`src/auth/auth.controller.ts`)

- **POST** `/auth/register`
  - **Body** (`CreateUserDto`):
    ```json
    {
      "fullName": "John Doe",
      "email": "john@example.com",
      "password": "secret123",
      "role": "ADMIN" // optional, defaults to USER
    }
    ```
  - **Response** 201:
    ```json
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    }
    ```

- **POST** `/auth/login`
  - **Body** (`LoginDto`):
    ```json
    { "email": "john@example.com", "password": "secret123" }
    ```
  - **Response** 200:
    ```json
    { "token": "<jwt-token>" }
    ```

- **POST** `/auth/logout`
  - **Headers**: `Authorization: Bearer <jwt-token>`
  - **Response** 200:
    ```json
    { "message": "Successfully logged out" }
    ```

### Events (`src/events/events.controller.ts`)

- **GET** `/events/all`
  - **Response** 200: `Event[]`

- **GET** `/events/:id`
  - **Params**: `id: number`
  - **Response** 200: `Event`

- **POST** `/events`
  - **Auth**: Bearer token required, role `ADMIN`
  - **Body** (`CreateEventDto`):
    ```json
    {
      "title": "Tech Conference",
      "description": "Annual tech meetup",
      "eventDate": "2025-12-01",
      "startTime": "10:00",
      "endTime": "16:00",
      "duration": "6h",
      "location": "Dhaka",
      "price": 100,
      "capacity": 200,
      "tags": ["tech", "conference"],
      "imageUrl": "/uploads/demo.png",
      "isActive": true
    }
    ```
  - **Response** 201: `Event`

- **PUT** `/events/:id`
  - **Auth**: Bearer token required, role `ADMIN`
  - **Body** (`UpdateEventDto`): partial of `CreateEventDto`
  - **Response** 200: `Event`

- **DELETE** `/events/:id`
  - **Auth**: Bearer token required, role `ADMIN`
  - **Response** 200:
    ```json
    { "message": "Event deleted successfully" }
    ```

- **POST** `/events/:id/register`
  - **Auth**: Bearer token required
  - **Response** 200:
    ```json
    { "message": "Successfully registered for event" }
    ```

- **POST** `/events/:id/cancel`
  - **Auth**: Bearer token required
  - **Response** 200:
    ```json
    { "message": "Successfully cancelled event registration" }
    ```

- **GET** `/events/my/registrations`
  - **Auth**: Bearer token required
  - **Response** 200: `EventRegistration[]` (demo):
    ```json
    [
      { "eventId": 1, "title": "Tech Conference", "registeredAt": "2025-10-01T10:00:00Z" }
    ]
    ```

- **GET** `/events/pages/paginated`
  - **Query**: `page?: number`, `limit?: number`, `dateFilter?: string`
  - **Response** 200 (demo):
    ```json
    {
      "data": [ { "id": 1, "title": "Tech Conference" } ],
      "page": 1,
      "limit": 10,
      "total": 25
    }
    ```

- **GET** `/events/search/query`
  - **Query**: `q: string`, `page?: number`, `limit?: number`
  - **Response** 200 (demo): same paginated structure as above

- **GET** `/events/admin/statistics`
  - **Auth**: Bearer token required, role `ADMIN`
  - **Response** 200 (demo):
    ```json
    { "totalEvents": 12, "totalRegistrations": 345, "activeEvents": 8 }
    ```

- **POST** `/events/:id/image`
  - **Auth**: Bearer token required, role `ADMIN`
  - **Form Data**: `file` (single file)
  - **Response** 200:
    ```json
    { "imageUrl": "/uploads/<filename>" }
    ```

### Bookings (`src/bookings/bookings.controller.ts`)

- All routes require Bearer token.

- **POST** `/bookings/new-booking`
  - **Body** (`BookSeatsDto`):
    ```json
    { "eventId": 1, "seats": 2 }
    ```
  - **Response** 201 (demo):
    ```json
    {
      "message": "Seats booked successfully",
      "booking": { "id": 10, "eventId": 1, "userId": 5, "seats": 2 }
    }
    ```

- **GET** `/bookings/all-bookings`
  - **Response** 200: user bookings array

- **DELETE** `/bookings/cancel-booking/:id`
  - **Params**: `id: number`
  - **Response** 200:
    ```json
    { "message": "Booking cancelled successfully" }
    ```

- **GET** `/bookings/paginated-bookings`
  - **Query**: `page?: number`, `limit?: number`
  - **Response** 200 (demo):
    ```json
    {
      "data": [ { "id": 10, "eventId": 1, "seats": 2 } ],
      "page": 1,
      "limit": 10,
      "total": 4
    }
    ```

- **GET** `/bookings/admin/all-bookings`
  - **Auth**: role `ADMIN`
  - **Response** 200: all bookings array

- **DELETE** `/bookings/admin/cancel-booking/:id`
  - **Auth**: role `ADMIN`
  - **Params**: `id: number`
  - **Response** 200:
    ```json
    { "message": "Booking cancelled by admin" }
    ```

- **GET** `/bookings/admin/paginated-bookings`
  - **Auth**: role `ADMIN`
  - **Query**: `page?: number`, `limit?: number`
  - **Response** 200: same paginated structure

### Users (`src/users/users.controller.ts`)

- **GET** `/users`
  - **Response** 200: `User[]`

- **GET** `/users/id/:id`
  - **Params**: `id: number`
  - **Response** 200: `User | null`

- **GET** `/users/email/:email`
  - **Params**: `email: string`
  - **Response** 200: `User | null`

### Static Uploads

- **GET** `/uploads/:filename`
  - Serves uploaded files. Example: `/uploads/abc123.png`

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
