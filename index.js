const express = require('express');
const path = require('path');
const app = express();
var contentful = require('contentful');

const { documentToPlainTextString } = require('@contentful/rich-text-plain-text-renderer');

require("dotenv").config();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const client = contentful.createClient({
    space: process.env.SPACE_ID,
    accessToken: process.env.ACCESS_TOKEN
})

app.get('/', async(req, res) => {

    client.getEntries()
    .then((response) => {
        
        /* had this for just text before
        let plainTextItems = [];
        response.items.forEach((item) => {
            plainTextItems.push( documentToPlainTextString(item.fields.blogPostBody) );           
        });   
        */
        
        let itemsTextWithPic = [];
        response.items.forEach((item) => {            

            // added for 'media many files' field
            let gallery = [];             
            item.fields.otherImages?.forEach((oi)=>{
                gallery.push(
                    {url: `https://${oi.fields.file.url}?w=200` }
                );
            });
            /**/
            
            itemsTextWithPic.push( 
                {
                    text: documentToPlainTextString(item.fields.blogPostBody),
                    picUrl: `https://${item.fields.blogPic.fields.file.url}?w=50`,
                    gallery // for 'media many files' field                   
                }
            );          
        });  // end of response.items.forEach() 

        res.render('pages/home', {
            title: 'Home',  
            //items: plainTextItems //['bag','car','pen','pencil','book']     
            items: itemsTextWithPic
        });  // end of res.render('pages/home')

    });  // end of .then()
    
});  // end of app.get('/')

app.listen(8080, () => {    
    console.log("Server successfully running on port 8080");
});