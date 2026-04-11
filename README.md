## How to setup a JavaScript project?

- Create root project folder: project-name
- Run:  
```
npm init
```
- Can additionally add .gitkeep file so that git tracks empty folder
- Create .env and .gitignore files
- Create src folder, and create files like app.js, constants.js and index.js
- Create folders inside src: model, controller, db, middleware, route and util
- Install nodemon which will help to reloading server automatically during development

## How to connect with MongoDB database?

- Create a cluster on MongoDB Atlas, we will be getting a connection string
- Define connection URI and in .env and DB name in constants.js
- Create an function inside src/db for database connection, connect using Mongoose
- We can later call this function in index.js for connection

#### Important notes:
- Always wrap code involving database communication inside try-catch because we often encounter errors, also make the function async
- Holding connection statement in a variable is good practice
- mongoose.connect returns an object called connection, contains various things like host and port

## How to import dotenv using module syntax?

- Import using regular syntax
- Configure using dotenv.config({})
- add this statement in dev script: -r dotenv/config --experimental-json-modules