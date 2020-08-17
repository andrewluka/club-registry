# Club Registry

This project was based off of [this sample](https://github.com/yhirose/react-typescript-electron-sample-with-create-react-app-and-electron-builder).

This a program that was built to keep track of games and users in a club: users can borrow and return games. Users and games must be added beforehand though.

Also, there is the concept of a session, which is the time from the start till the end of a session. Sessions help in gaining insight over who attends the club, and when do they arrive (late, early).

## Building

Node.js, Python and Visual Studio C++ Toolchain (Windows only) are required to build the [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) native dependency. To build from source, open a terminal (or command prompt) in the project root directory and type this:

```
npm install
npm run electron:build
```

## Plans

<ul>

<li>At the moment, the games' 'tags' field is not very usefull, but game usage statistics can be generated from it: we can count the number of times a tag has been borrowed, and thus gain insight into its popularity. Tags can be anything, but they ought to be descriptive. For example, a 'chess' game could have tags like '1v1', 'multiplayer', 'mind game' or something like that.
</li>

<li>
Settings seem to be a bit set in stone, and this could be changed. People who use the program should be able to choose a theme, change locale, etc.
</li>

</ul>
