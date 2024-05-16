const express = require('express');
const path = require('path');
const app = express();
var contentful = require('contentful');

const { documentToPlainTextString } = require('@contentful/rich-text-plain-text-renderer');

require("dotenv").config();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// set up client
const client = contentful.createClient({
    space: process.env.SPACE_ID,
    accessToken: process.env.ACCESS_TOKEN
})


// home or index or default route
app.get('/', async(req, res) => {

    client.getEntries()
    .then((response) => {
        
        let plainTextItems = [];
        response.items.forEach((item) => {
            plainTextItems.push( documentToPlainTextString(item.fields.blogPostBody) );
        });  // end of forEach()       

        res.render('pages/home', {
            title: 'Home',  
            items: plainTextItems //['bag','car','pen','pencil','book']     
        });  // end of res.render('pages/home')

    })  // end of .then()
    
});  // end of app.get('/')


app.listen(8080, () => {    
    console.log("Server successfully running on port 8080");
});