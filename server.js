const app = require('./app');

let localEnv = null;

if (app.get('env') === "development") {
  localEnv = require('dotenv');
  localEnv.config(); 
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running. Use our API on port: ${PORT}`)
})
