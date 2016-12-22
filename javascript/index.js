var firstDirs = ["Work Experience", "Projects", "Golf", "Resume", "Contact"]
var helpStr = "Type 'ls' to look at the contents of your current directory.\n"+
    "Type 'cd [director name]' to enter a certain directory.\n"+
    "Type 'cd ..' to go back up one directory.";

function processCommand(str) {
    //ls, cd, open, help
    var words = str.split(" ");
    if(words.length > 0) {
        switch(words[0]) {
            case "ls":
                //list contents of directory
                break;
            case "cd":
                //open directory
                break;
            case "open":
                break;
            case "help":
                break;
            default:
                //error
                break;
        }
    }
}