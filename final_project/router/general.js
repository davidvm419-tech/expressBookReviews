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
    // Check if username is valid
    if (isValid(username)) {
        users.push({
            username: username,
            password: password,
        })

        return res.status(200).json({message: "User successfully registered. Now you can login."});

    } else {
        return res.status(404).json({message: "User already exists!"});
    }
} else {
    return res.status(404).json({message: "Unable to register user."});
}
});


// Task 10: Get the book list available in the shop
// Using an asynchronous callback function 
public_users.get('/', function (req, res) {
// simulation of a callback to return the books object
const getBooks = (callback) => {
    callback(null, books);
};

getBooks((err, data) => {
    if (err) {
        return res.status(500).json({message: "error while getting books"});
    }
    return res.status(200).json(data);
});
});


// Task 11: Get book details based on ISBN 
// Using Promises
public_users.get('/isbn/:isbn', function (req, res) {

const isbn = req.params.isbn;

// use axios to get all books from the shop and find the one with the isbn using a promise
axios.get('http://localhost:5000/')
    .then((response) => {
        const book = response.data[isbn];
        if (!book) {
            return res.status(404).json({message: `Book with isbn ${isbn} not found`});
        } else {
            return res.status(200).json(book);
        }
    })
    .catch((error) => {
        console.log(`Error: ${error}`)
        return res.status(500).json({message: "error while getting book"});
    });
});


// Task 12: Get book details based on author
public_users.get('/author/:author', async function (req, res) {

// Get url params 
const author = req.params.author;
let authorCheck = author.toUpperCase();

try {
    // use axios to fetch the books list then do the filtering logic
    const response = await axios.get('http://localhost:5000/');
    const booksData = response.data;
    
    // Get books keys
    const booksIsbn = await Object.keys(booksData);
    
    // Iterate over the books with the key to get the books keys of that author
    // compare the author name after changing it to uppercase for the match
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


// Task 13: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
// Get url params 
const title = req.params.title;
let titleCheck = title.toUpperCase();
try {
    // Call the local api with axios to get books then filter by title
    const response = await axios.get('http://localhost:5000/');
    const booksData = response.data;

    // Get books keys
    const booksIsbn = await Object.keys(booksData)
    
    // Iterate over the books with the key to get the books keys of that author
    // check the title against the titleCheck variable
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
// Check if book exists
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
