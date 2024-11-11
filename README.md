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
    MONGODB=YOUR_URL_MONGODB
    JWT_SECRET=YOUR_SECRET
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

1. Edit the node .env
    ```env
        NODE_ENV=production
        PRODUCTION_ORIGIN=API_IP_OR_DOMAIN_NAME
    ```
2. Start and install for production mode: 
    ```sh 
    npm install 
    npm run start 
    ```