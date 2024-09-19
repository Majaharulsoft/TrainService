# train-service

Backend Developer Interview Task at bdCalling

### <u><b>Project Setup:</b></u>

<ol>
<li>Clone the repository: </li>

```bash
git clone https://github.com/Abir-Al-Arafat/train-service.git
```

<li>Navigate into the directory:</li>

```bash
cd train-service
```

<li>Install the necessary packages:</li>

```bash
npm install
```

<li>Navigate to the .env file to set the connection string for database, set jwt secret and expiry time </li>

<li>Run the project in dev using:</li>

```node
npm run dev
```

</ol>

### <u><b>This is a Train Service Management System with Scheduling, Wallet Integration, and User Management:</b></u>

# This system includes two types of users:

1. Admin
2. User

# Description:

1. User Management:
   - User can register and login.
   - JWT used for secure authentication and authorization.
   - Passwords been hashed using bcrypt before storing them in the database.
2. Station Management:
   - Endpoints implemented for creating, updating, and retrieving station information.
3. Train Management:
   - Endpoints implemented for creating, updating, and retrieving train schedules and stops.
   - Each train has a list of stops with accurate timings.
4. Wallet Integration:
   - Implemented endpoints for adding funds to user wallets.
   - Wallet balance can be updated and transaction history is maintained.
5. Ticketing System:
   - Implemented endpoints for purchasing tickets using wallet balance.
   - Fare is calculated based on train stops and wallet balance updated accordingly.
6. Middleware for Authentication and Validations:
   - Middlewares added for validations and to protect routes and ensure only authenticated users can access them.
7. Error Handling
8. Ticket Scheduling:
   - node-cron added for ticket scheduling

<p><strong>Project  Structure:</strong></p>

```
    src/
        config/
        constants/
        controller/
        data/
        middleware/
        model/
        routes/
        utilities/
        .env
        index.js
```

<span>Necessary Dependencies</span>

<ol>
    <li>
        <a href="https://www.npmjs.com/package/dotenv">dotenv</a>
    </li>
    <li>
        <a href="https://www.npmjs.com/package/express">express</a>
    </li>
    <li>
        <a href="https://www.npmjs.com/package/express-validator">express-validator</a>
    </li>
    <li>
        <a href="https://www.npmjs.com/package/mongoose">mongoose</a>
    </li>
    <li>
        <a href="https://www.npmjs.com/package/jsonwebtoken">jsonwebtoken</a>
    </li>
    <li>
        <a href="https://www.npmjs.com/package/bcryptjs">bcryptjs</a>
    </li>
    <li>
        <a href="https://www.npmjs.com/package/node-cron">node-cron</a>
    </li>
</ol>
