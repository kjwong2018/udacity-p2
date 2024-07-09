import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';



  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get( "/filteredimage", async (req, res) => {

    const query_value = req.query.image_url;

    // Only accept image_url query key
    if (!req.query.image_url){
      console.log(`Client request contains unsupported query key, returning 501 with suggestion`)
      return res.status(501).send("Unsupported query, we currently only accept 'image_url' query.")
    }

    // Check if URL ends with jpg or jpeg
    if (!query_value.endsWith("jpg") && !query_value.endsWith("jpeg")){
      console.log(`Client request is not a jpg or jpeg, returning 501 with suggestion`)
      return res.status(501).send("Unsupported query, we currently only accept 'jpg' or 'jpeg' query.")
    }

    // Send filtered image and remove from local storage after
    // Reference: https://blog.logrocket.com/guide-promises-node-js/
    filterImageFromURL(query_value)
    .then(data => {
      res.sendFile(data, () => deleteLocalFiles([data]));
    })
    .catch(err => {
        console.log(err)
        res.status(422).send("Something went wrong on our end, unprocessable entity")
    })
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
