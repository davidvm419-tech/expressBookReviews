const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (username && password) {
        // Chheck ud username is valid
        if (isValid(username)) {
            users.push({
                username: username,
                password: password,
            })

            return res.status(200).json({message: "User successfully registered. Now you can login"});

        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    } else {
        return res.status(404).json({message: "Unable to register user."});
}
});

const axios = require('axios');

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        console.log(`Error: ${error}`)
        return res.status(500).json({message: "error while getting books"});
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {

    const isbn = req.params.isbn;

    try {
        const response = await axios.get('http://localhost:5000/');
        const book = response.data[isbn];
        if (!book) {
            return res.status(404).json({message: `Book with isbn ${isbn} not found`});
        } else {
            return res.status(200).json(book);
        }
    } catch (error) {
        console.log(`Error: ${error}`)
        return res.status(500).json({message: "error while getting book"});
    }
});
  

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    
    // Get url params 
    const author = req.params.author;
    let authorCheck = author.toUpperCase();

    try {
        const response = await axios.get('http://localhost:5000/');
        const booksData = response.data;
        // Get books keys
        const booksIsbn = await Object.keys(booksData);
        // Iterate over the books with the key to get the books keys of that author
        const authorBooksIsbn = booksIsbn.filter(isbn => booksData[isbn].author.toUpperCase() === authorCheck);

        // Get the author books
        const authorBooks = authorBooksIsbn.map( isbn => booksData[isbn] );
        
        if (authorBooks.length === 0) {
            return res.status(404).json({message: `Book with author ${author} not found`});
        } else {
            return res.status(200).json(authorBooks);
        }
    } catch (error) {
        console.log(`Error: ${error}`)
        return res.status(500).json({message: "error while getting books"});
    }
    
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    // Get url params 
    const title = req.params.title;
    let titleCheck = title.toUpperCase();
    try {
        const response = await axios.get('http://localhost:5000/');
        const booksData = response.data;
        // Get books keys
        const booksIsbn = await Object.keys(booksData)
        
        // Iterate over the books with the key to get the books keys of that author
        const titleBooksIsbn = booksIsbn.filter(isbn => booksData[isbn].title.toUpperCase() === titleCheck);

        // Get the author books
        const booksByTitle = titleBooksIsbn.map( isbn => booksData[isbn] );
        
        if (booksByTitle.length === 0) {
            return res.status(404).json({message: `Book with title ${title} not found`});
        } else {
            return res.status(200).json(booksByTitle);
        }
    } catch (error) {
        console.log(`Error: ${error}`)
        return res.status(500).json({message: "error while getting books"});
    }
});



//  Get book review
public_users.get('/review/:isbn',function (req, res) {

    const isbn = req.params.isbn;

     if (!books[isbn]) {
        return res.status(404).json({message: `Book with isbn ${isbn} not found`});
    } else {
        const bookReviews = books[isbn].reviews;
        
        // Check if the reviews object is empty
        if (Object.keys(bookReviews).length === 0) {
            return res.status(404).json({message: "No reviews found for this book."});
        } else {
            return res.status(200).json(bookReviews);
        }
    }
});

module.exports.general = public_users;
