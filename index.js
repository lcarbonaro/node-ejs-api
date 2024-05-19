const express = require('express');
const path = require('path');
const app = express();
const contentful = require('contentful');

const { documentToPlainTextString } = require('@contentful/rich-text-plain-text-renderer');

require("dotenv").config();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const client = contentful.createClient({
    space: process.env.SPACE_ID,
    accessToken: process.env.ACCESS_TOKEN
})

app.get('/product/:id', async (req,res) => {

    //console.log('in /product route');
    //console.log(req.query.id);

    let product;

    client.getEntry(req.params.id)
    .then((prod) => {
         
        let gallery = [];             

        // include main image in gallery
        gallery.push({
            url: `https://${prod.fields.mainImage.fields.file.url}?w=250`,
        });

        // add gallery images
        prod.fields.imageGallery.forEach((img)=>{
            gallery.push(
                {url: `https://${img.fields.file.url}?w=250` }
            );
        });
                 
        product = {
            name: prod.fields.name,
            desc:  documentToPlainTextString(prod.fields.description),
            cat: prod.fields.category,
            gallery
        };

        res.render('pages/product', {        
            product
        });  
         
    });  // end of .then()

});  // end of app.get('/product')

app.get('/products', async (req,res) => {

    client.getEntries({ content_type: 'productCatalog' })
    .then((entries) => {

        //console.log( JSON.stringify( entries.items[0]) );
        
        let catalog = [];
        entries.items.forEach((item) => { 
            catalog.push({
                entryId: item.sys.id, // entry id
                productName: item.fields.name,
                productDesc:  documentToPlainTextString(item.fields.description),
                productCat: item.fields.category,
                productImg: `https://${item.fields.mainImage.fields.file.url}?w=100`,
            });

        });  // end of forEach()

        res.render('pages/catalog', {
            title: 'My Product Catalog',              
            catalog
        });  // end of res.render('pages/catalog')

        


    }); // end of .then()

});  // app.get('/products'

app.get('/', async(req, res) => {

    client.getEntries({ content_type: 'post' })  // had to add this since I now have different content types
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