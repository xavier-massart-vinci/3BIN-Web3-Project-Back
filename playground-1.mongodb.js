// Use the database and collection directly
use("web3"); // Switches to the "web3" database

// Define the user object
const newUser = {
    username: "Alex",          // Replace with desired username
    password: "$2b$13$hashedPassword",  // Replace with bcrypt-hashed password
    friends: []                        // Optional: Add any default friends
};

// Insert the user document
const result = db.User.insertOne(newUser);
console.log("User added successfully:", result);
