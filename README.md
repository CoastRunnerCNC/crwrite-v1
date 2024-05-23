# CRWrite
CRWrite is a software published by Coast Runner CNC to facilitate interacting with Coast Runner's desktop CNC mills, such as the Coast Runner CR-1.
This software contains two major "modes":

- Guided Mode: this mode reads a predefined "cutcode" file (aka "crproj") which defines a sequence of steps for a milling job. Each step may contain a title, descriptive text, illustrative images, gcode to execute and more.
- Manual Mode: this mode is a more traditional way of interacting with a CNC, containing a DRO, status readout, jogging controls, manual command entry, gcode file upload and more.

For more information about Coast Runner, visit coastrunner.net.

## Build
For instructions on how to compile and build the code, see docs/BUILD.md.

## Design
CRWrite is a cross-platform C++ application that runs as a daemon and communicates via USB with Coast Runner CNC mills. It has an HTML/CSS/JS front-end that communicates with the daemon via a custom Node.JS V8 add-on. The logic is entirely separate from the UI, which makes it trivial to swap out different implementaitons of the UI.
