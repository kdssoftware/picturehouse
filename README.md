# Image Gallery Rooms

## Links
Production: https://www.picturehouse.be/

Development: https://gallery.snakehead007.codes/

## What is it?
This will be a free site where user can easly upload pictures and share them around with people.

Its best use is in an event (wedding, birthday, bbq. ...) where are lots of people take pictures of their own.

This site can easly collect all pictures that everyone took during the event.

Each person can get access a room.

There all the pictures of the event can be viewed, easily be added or downloaded.

## Limits and functionalities

- Each room will have a maximum amount of 1000 pictures or 4GiB (whichever comes first)
- There will be no limit to the amount of rooms created
- A room that is inactive after 1 month will be deleted
- All pictures can be downloaded from a room in a zip-file 
- A room can be password protected

## Technical aspects
 - Using MongoDB as Database
 - Using Next.js as web framework
 - deployed using vercel

### ToDo list
- [x] create new rooms
- [x] password protect rooms
- [x] upload images
- [x] receive images
- [ ] receive room owner rights with email when creating room
- [ ] change password of room
- [ ] unlock room, no password needed
- [ ] remove room
- [ ] view images in room
- [ ] gallery scroll images in room
- [ ] styling
- [ ] sort images by date
- [ ] download images as zip file
- [ ] add googledrive to upload unlimited pictures (limited by your Google drive)
- [ ] add one drive to upload unlimitied pictures (limited by your OneDrive)
