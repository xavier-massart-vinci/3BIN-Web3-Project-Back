# Project Web3 Back

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/xavier-massart-vinci/3BIN-Web3-Project-Back.git
   ```

2. Navigate to the project directory:
   ```sh
   cd project-web3-back
   ```
3. Create .env and add the following environment variables:

   ```env
   NODE_ENV=development
   MONGO_URI=YOUR_URL_MONGODB
   JWT_SECRET=YOUR_SECRET
   PORT=3000
   DELAY_BETWEEN_MESSAGES=1000 # in milliseconds
   MAX_MESSAGE_LENGTH=500 # in characters
   ```

4. Install the dependencies:

   ```sh
   npm install
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

## Production

1. Edit the node .env and add
   ```env
       NODE_ENV=production
       MONGO_URI=[YOUR URI TO YOUR MONGO DB]
       JWT_SECRET=[YOUR SECRET]
       PORT=3000
       RAPIDAPI_KEY=[YOUR RAPIDAPI KEY]
       GIPHY_API_KEY=[YOUR GIPHY API KEY]
   ```
2. Start and install for production mode:
   ```sh
   npm install
   npm run start
   ```
