![Picture House](https://github.com/snakehead007/picturehouse/blob/master/public/logo.svg)

## Links
Production: https://www.picturehouse.be/

Development: https://gallery.snakehead007.codes/

## What is it?
This will be a free site where user can easly upload pictures and share them around with people.

Its best use is in an event (wedding, birthday, bbq. ...) where are lots of people take pictures of their own.

This site can easly collect all pictures that everyone took during the event.

Each person can get access a room.

There all the pictures of the event can be viewed, easily be added or downloaded.

## Limitations

Currently there are no limitations to a room of amount and size, you can also create as much rooms as you want.

Future limitations:
- Each room will have a maximum amount of 1000 pictures or 4GiB (whichever comes first)
- 2 rooms per person
- A room that is inactive after 1 month will be deleted

Current limitations:
- 300 rooms can be created a day (due to the free mailing services) (will be replaced by Google login in the near future)

## Technical aspects
 - Using MongoDB as Database
 - Using Next.js as web framework
 - deployed using Vercel
 - File uploading API server [picturehouse-images](https://github.com/snakehead007/picturehouse-images)
 - NAS server for storage to place images
 - Loadbalancing 20 API servers using Docker-compose and Haproxy using [these configs](https://github.com/snakehead007/loadbalancer)

### ToDo list
- [x] create new rooms
- [x] password protect rooms
- [x] upload images
- [x] receive images
- [x] receive room owner rights with email when creating room
- [x] change password of room
- [x] unlock room, no password needed
- [x] view images in room
- [x] gallery scroll images in room
- [x] pinch, zoom and scroll full sized images
- [ ] remove room
- [ ] Delete images
- [ ] sort images by date
- [ ] download images seperate
- [ ] download images as zip file
- [ ] login using Google and manage your room
- [ ] Add limitations to rooms
- [ ] add googledrive to upload unlimited pictures (limited by your Google drive)
- [ ] add one drive to upload unlimitied pictures (limited by your OneDrive) 
