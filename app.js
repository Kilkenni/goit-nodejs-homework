const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const mongoose = require("mongoose");

const localEnv = require('dotenv');
localEnv.config(); 

const contactsRouter = require('./routes/api/contacts')

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

let winston = null;

const DB_HOST = `mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}`;

mongoose.connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Mongoose: failed to connect to database");
    console.log(error.message);
    process.exit(1);
  });

if (app.get('env') === "development") {
  winston = require('winston');

  //color codes for some of the default winston log levels
  const winstonColors = {
    info: "cyan",
    warn: "yellow",
    error: "red",
  }

  winston.configure({
    format: winston.format.combine(
      winston.format.colorize({all: true, colors: winstonColors}),
      winston.format.label({ label: "WINSTON" }),
      winston.format.timestamp({format: "YY-MM-DD HH:mm:ss"}),
      winston.format.printf((logEntry) => {
        return `${logEntry.label} ${logEntry.timestamp} ${logEntry.level}: ${logEntry.message}`;
      }),
    ),
    transports: [
      new winston.transports.Console(),
    ],   
  });

  winston.info("Winston logging initiated for dev mode.");
}

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' })
})

app.use((err, req, res, next) => {
  //if we are in dev mode, winston is defined, so we can use it directly to show the error in the console
  //why not console.log? Because we may want to log into a file instead. Moreover, console.log is synchronous. Using winston is good for practice.
  if (winston) {
    winston.error(`Error processing request. statusCode=${err.statusCode}, message=${err.message}`);
  }
  next(err);
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal server error.", details } = err;
  if (!err.statusCode) {
    console.error("Non-HTML error!"); //ideally this should never happen: we must eliminate all general runtime errors before prod
    throw err;
  }
  //force messages to conform to HW description
  if (statusCode === 404) {
    res.status(statusCode).json({ message: "Not found" });
    return;
  }
  if (statusCode === 400) {
    res.status(statusCode).json({ message: details? details[0].message : message });
    return;
  }
  //end force
  res.status(statusCode).json({ message, details });
})

module.exports = app;
