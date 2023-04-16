# PopChat 2

An online chat room that emphasizes zero-log and zero-store.

<img src=".github/01.jpg?raw=true" height="350">

<img src=".github/02.jpg?raw=true" height="500">

## Feature highlights

- No registration is required.
- Does not store any user data.
- Chatroom will be automatically destroyed after all users have left.
- Supports file transfer.

## Special notes

This project was adapted from Andrew Mead's project when I took his Node.js course on Udemy in 2020. Compared to the original project, this project:

1. Redesigned and restructured the backend.
2. Switched the template engine to `Handlebars`.
3. Separated creating and joining rooms.
4. Supports file transfer.
5. Offline detection.

## Installation

1. Install [Node.js](https://nodejs.org).
2. Open a terminal and clone the project (requires [Git](https://git-scm.com/)).

    ```bash
    $ git clone https://github.com/RapDoodle/PopChat2.git
    ```

3. `cd` into the project folder

    ```bash
    $ cd PopChat2
    ```
   
4. Install project dependencies

    ```bash
    $ npm install
    ```

5. Install `env-cmd`

    ```bash
    $ npm install env-cmd
    ```

6. Install `pm2`
   
   ```bash
    $ npm install -g pm2
    ```

7. Review the configurations in `./config/production.env`. For more instructions, please refer to the section on [Configurations](#configurations).

7. Start the server

    ```bash
    $ npm start
    ```

8. After the server started successfully, access the application using the URL shown in the terminal (e.g., http://0.0.0.0:8000). For remote access, please check your IP address using `ifconfig` (for Unix and Linux users) or `ipconfig` (for Windows users).

9. Terminate the server

    ```bash
    $ npm stop
    ```

## Configurations

System configurations can be found in the `./config/production.env`. The configurable environmet variables are as follows.

|Variable name|Description|Default value|
|-|-|-|
|POP_CHAT_ADDR|The address the application will listen to|0.0.0.0|
|POP_CHAT_PORT|The port the appliaction will listen to|8000|
|POP_CHAT_ENABLE_HTTPS|Whether or not to enable HTTPS|0|
|POP_CHAT_PRIVATE_KEY_PATH|The path to your private key|(NOT SPECIFIED)|
|POP_CHAT_CERT_PATH|The path to your public key|(NOT SPECIFIED)|
|POP_CHAT_MAX_ROOMS|Maximum number of rooms at any time|100|
|POP_CHAT_MAX_ROOM_CAPACITY|Maximum number of online users in a room.|20|
|POP_CHAT_ROOM_ID_LENGTH|The length of randomly generated room ID|5|
|POP_CHAT_MAX_FILESIZE|Maximum file upload size in bytes.|10000000 (10 MB)|

## References

This project was adapted from Andrew Mead's Udemy course [The Complete Node.js Developer Course (3rd Edition)](https://www.udemy.com/course/the-complete-nodejs-developer-course-2/).