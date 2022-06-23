const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const contactsRouter = require('./routes/api/contacts')
const usersRouter = require("./routes/api/users");
const publicRouter = require("./routes/public.js");

const app = express();

const { ServerError } = require("./errors/ServerError");

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

let winston = null;

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

app.use('/api/contacts', contactsRouter);

app.use("/api/users", usersRouter);

app.use("/", publicRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' })
})

//Error logger
app.use((err, req, res, next) => {
  //if we are in dev mode, winston is defined, so we can use it directly to show the error in the console
  //why not console.log? Because we may want to log into a file instead. Moreover, console.log is synchronous. Using winston is good for practice.
  if (winston) {
    const { statusCode, message, details } = err;
    winston.error(`Error processing request. statusCode = ${statusCode}, message = ${message}`);
    if (details) {
      details.forEach((detail) => {
        return winston.error(`Reason: ${detail.message}`);
      })
    }
  }
  next(err);
});

//Error handler
app.use((err, req, res, next) => {
  if ( !(err instanceof ServerError) ) {
    console.error("Non-HTTP error!"); //ideally this should never happen: we must eliminate all general runtime errors before prod

    //SyntaxError is OK, probably invalid JSON, no need to fret
    if (!(err instanceof SyntaxError)) {
      throw err;
    }
  }

  const { statusCode = 500, message = "Internal server error.", details } = err;
  //force messages to conform to HW description
  if (statusCode === 400) {
    let badReqMessage = details ? details[0].message : message;
    if (badReqMessage === '"favorite" is required') {
      badReqMessage = "missing field favorite";
    }
    res.status(statusCode).json({
      type: (details)? "Validation error" : "Bad request. Check request and body",
      message: badReqMessage,
    });
    return;
  }
  //end force
  res.status(statusCode).json({ message });
})

module.exports = app;
