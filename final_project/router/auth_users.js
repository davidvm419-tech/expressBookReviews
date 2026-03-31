const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let invalidUsername = users.find(user => user.username === username);

    if (invalidUsername) {
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username, password)=>{ //returns boolean

    // Check valid data
    let validCredentials = users.find(user => {
        return user.username === username && user.password === password
    });

    if (validCredentials) {
        return true;
    } else {
        return false;
    }
}


//only registered users can login
regd_users.post("/login", (req,res) => {

    // Get data
    const username = req.body.username;
    const password = req.body.password;
    
    // Check that user and passwword are given
    if (username && password) {
        
        // Data validaton
        if (authenticatedUser(username, password)) {
            let accessToken = jwt.sign({
                data: password,
            },
            "access", {expiresIn: 60}
            );

            // Store user data
            req.session.authorization = {
                accessToken, username
            }
            return res.status(200).json({message:"Login successful!"});
        } else {
            return res.status(404).json({message: "Invalid Login. Check username and password"});  
        }

    } else {
        return res.status(404).json({message: "Invalid Login. Check username and password"});
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    // Get book isbn
    const isbn = req.params.isbn;
    
    // Get review data
    const review = req.body.review;
    
    // Get username
    const username = req.session.authorization["username"]

    // Get book
    const book = books[isbn]

    // Check if book exists
    if (book) {

        // If user already has a review update that review
        if (book.reviews[username]) {
            book.reviews[username] = review
            return res.status(200).json({
                message: `The review for the book with ISBN ${isbn} has been added/updated.`, 
                review: book.reviews});
        } else {
            // Add review to the book
            book.reviews[username] = review            
            return res.status(200).json({
                message: `The review for the book with ISBN ${isbn} has been added/updated.`, 
                review: book.reviews});
        }
    } else {
        return res.status(404).json({message: `Book with isbn ${isbn} not found`});
    }

});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    // Get book isbn
    const isbn = req.params.isbn;
    
    // Get username
    const username = req.session.authorization["username"]

    // Get book
    const book = books[isbn]

    // Check if book exists
    if (book) {
        // delete the user review if exists
        if (book.reviews[username]) {
            delete book.reviews[username]
            return res.status(200).json({message: `Reviews for ISBN ${isbn} posted by user ${username} deleted`});
        } else {
            return res.status(404).json({message: "User hasn't reviwed this book"});
        }

    } else {
        return res.status(404).json({message: `Book with isbn ${isbn} not found`});
    }

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
