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
        setTimeout(() => {
            callback(null, books)
        }, 100)
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
    // Get url params
    const isbn = req.params.isbn;

    // Create a new promise to find the book in the local booksdb
    const findBookIsbn = new Promise((resolve, reject) => {
        // Simulating async retrieval from the books object
        const book = books[isbn];
        
        if (book) {
            resolve(book);
        } else {
            reject(`Book with isbn ${isbn} not found`);
        }
    });

    // Handle the promise resolution
    findBookIsbn
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((error) => {
            // Handle case were book is not found
            return res.status(404).json({ message: error });
        });
});



// Task 12: Get book details based on author
public_users.get('/author/:author', async function (req, res) {

    // Get url params 
    const author = req.params.author;
    let authorCheck = author.toUpperCase();

    try {
        const booksByAuthor = new Promise((resolve, reject) => {
            // Get books keys directly from the local books object
            const booksIsbn = Object.keys(books);
            
            // Iterate over the books with the key to get the books keys of that author
            // compare the author name after changing it to uppercase for the match
            const authorBooksIsbn = booksIsbn.filter(isbn => books[isbn].author.toUpperCase() === authorCheck);

            // Get the author books
            const authorBooks = authorBooksIsbn.map(isbn => books[isbn]);

            if (authorBooks.length === 0) {
                reject(`Book with author ${author} not found`);
            } else {
                resolve(authorBooks);
            }
        });

        // Use await to get the result from promise
        const result = await booksByAuthor;
        return res.status(200).json(result);

    } catch (error) {
        // If the promise is rejected
        return res.status(404).json({ message: error });
    }
});


// Task 13: Get all books based on title
public_users.get('/title/:title', async function (req, res) {

    // Get url params 
    const title = req.params.title;
    let titleCheck = title.toUpperCase();

    try {
        // Create a promise 
        const getooksByTitle = new Promise((resolve, reject) => {
            // Get books keys directly from the local books object
            const booksIsbn = Object.keys(books);
            
            // Iterate over the books with the key to get the book keys of that title
            // check the title against the titleCheck variable
            const titleBooksIsbn = booksIsbn.filter(isbn => books[isbn].title.toUpperCase() === titleCheck);

            // Get the books by title
            const booksByTitle = titleBooksIsbn.map(isbn => books[isbn]);

            if (booksByTitle.length === 0) {
                reject(`Book with title ${title} not found`);
            } else {
                resolve(booksByTitle);
            }
        });

        // Use await to get the result from our local promise
        const result = await getBooksByTitle;
        return res.status(200).json(result);

    } catch (error) {
        // Handle cases where the title is not found or other errors
        return res.status(404).json({ message: error });
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
