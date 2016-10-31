[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=USUR8CPL56B2Y)

# TREPL
TRE is an object oriented, functional programming language, that enables user to view all processes happening inside a memory during program execution.

Working example can be found here: http://trepl.xyz/

# Compilation
To restore node packages run
```
npm install
```

To compile .ts files run:
```
gulp typescript
```
and for .less files:
```
gulp less
```

To watch for changes (in .ts and .less files) you can use:
```
gulp watch
```

# Execution
To prepare compiled website for execution you have to restore node_modules within Site directory.
```
cd Site
npm install
```
after doing so you can run the server:
```
node .\TREPL\Site\
```
Now your website should be available in your web browser under the address: http://localhost:3000/

# Project structure
This project was my first contact with javascript and typescript (excluding scripts that consisted of 5 lines of code), so the overall architecture of this solution is not the greatest. I will try to reorganize it itno something better in the future, as I have gained "some"
experience in this meantime

# Beta
Note that this is an early version of this software. If you can see anything that doesn't work as expected, or maybe a way to improve it, please inform me.
