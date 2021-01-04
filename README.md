# aws-s3-manage-by-key
An aws s3 file manager using accessId and secret written in nodejs with terminal interface.

# Getting Started
## Prerequisites
 - node 10.9.0 or higher
 - populate the neccesarry info in `./config/index.js` if you want to auto load aws s3 credentials
 
## Running the manager
 1. open the command prompt and navigate to to root forlder of this repo.
 2. start the app using the command `npm start`
 3. From the starting options, you are prompted to use and existing config file or to manually type in aws s3 credentials.

 >Note: The upload command will upload files that is in the `./content` folder.
