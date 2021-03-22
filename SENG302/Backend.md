Security: bunch of filters betwween the HTTP requests and controller. Interacts with the DAO through DAO authenticator to determine if user is admin etc.

Controller: define API endpoints

Service: business logic
  - UserService
  - BusinessService

DAO: persistence layer

Interfaces for services and DAOs define the public interfaces

Beans: all objects stored in bean container which caches objects

Session: give client ID; DB stores data

Token: all data stored on client
