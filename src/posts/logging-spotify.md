---
date: 2019-10-02
title: 'Logging Spotify'
slug: 'logging-spotify'
published: true
tags: ['python', 'spotify']
---

I listen to a lot of music. Basically anything I can get my ears on I’ll play at least once, so, for these purposes, Spotify works pretty well. Unfortunately, as much as I like it, Spotify doesn’t give me many statistics about what I listen to. Sure, I get auto-generated playlists every day from random genres or artists, but if I want to look up how many times I’ve listened to [Veridis Quo](https://open.spotify.com/track/2LD2gT7gwAurzdQDQtILds?si=82e65cc8aff34352), tough luck.

Fortunately, Spotify provides [a public API](https://developer.spotify.com/documentation/web-api) that gives you access to a user’s Spotify account, where you can view their liked songs, playlists, and what they’re currently listening to, among other things. The last point is the one I wanted to focus on most, as seeing exactly what I’m listening to and storing that information would eventually build up a large database of my listening statistics.

Spotify [does not provide webhooks](https://github.com/spotify/web-api/issues/538), meaning that we will have to constantly poll the API for what the current user is listening to and store that information. This practice is known as API Polling (go figure), and, while it is definitely less efficient than webhooks, we can make do.

## Registering

To access any of this data, we need to register an application in order to get a `client-id` and a `client-secret`. To set this up, we just need to access the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create a new application. Once this is done, the `client-id` and `client-secret` need to be stored securely (preferably not under version control). In my case, I created an `auth.py` file with individual variables containing the `client-id` and `client-secret` strings. Then, I add `auth.py` to my `.gitignore` file to prevent any accidental commits, and imported the authentication info directly into `log.py`.

## Authentication

Before we can dig into the data of the song I’m currently listening to (hint: it’s not an [Old Town Road remix](https://open.spotify.com/track/6jmZlyf9DxcIoRrjw02YXm)), we need to authenticate with Spotify. There are 3 provided paths for authentication, and since only one of them was 'suitable for long-running applications in which the user grants permission only once', I went with the Authorization Code Flow.

To start, we need the user to authorize access to their account, which will then give us an authorization code. This is done by sending a `GET` request to the `/authorize endpoint`. There’s a variety of data sent along with this request, one of which being the scopes that are defined for the application. Spotify uses scopes to limit what sort of data an authenticated script is able to access, so for the purposes of our project, we only needed the `user-read-playback-state` scope to see what the user is listening to. Once the user accepts the authorization, they get sent to the Redirect URI we specified in the Spotify App we set up earlier. This URI contains the authorization code. To get the actual code, we send a POST request to the `/token` endpoint with the `grant_type` parameter set to `authorization_code`. As a response, we get out authorization token!

This token has a secret, however. It expires every 60 minutes (we can see this in the `expires_in` field of the JSON), meaning we need to refresh the token to keep monitoring the user’s listening activity. To do this, we use the `refresh_token` that was provided alongside our original authorization token. When we send a request for the user’s listening activity, a 401 HTTP Response will be sent if the token is expired. When this happens, we just send a POST request the `/token` endpoint, this time with a grant_type of `refresh_token`, and we get a fresh new token to use!

## Data Collection

Now that we have a token, we can actually start sending requests and getting the listening activity of the user. Since we’re interested in ["Get(ing) Information About The User’s Current Playback"](https://developer.spotify.com/documentation/web-api/reference/player/get-information-about-the-users-current-playback/), we just need to send a GET request to the `v1/me/player` endpoint (do keep in mind that at the time of this writing, this endpoint is in Beta and may be unstable). In the case of a 204 response, there isn’t a track playing or the user is in a private session, and in the case of a 401 response, the token is expired and needs to be refreshed. Assuming we get a 200 response, we will get back JSON data detailing the current playback of the authenticated user. This should look something like the following:

```json
{
"device": {
    "id":"XXXXXXXXXXXXXXXXXXXXXXXXXx",
    "is_active":True,
    "is_private_session":False,
    "is_restricted":False,
    "name":"Hello World",
    "type":"Computer",
    "volume_percent":41
    ...
    "shuffle_state":False,
    "timestamp":1564879028781,
    "currently_playing_type":"track",
    "actions":{
        "disallows":{
            "resuming":True
        }
    },
    "is_playing":True
}
```

Right off the bat, there are some attributes that we do want to keep, and others that are not so interesting. For example, `timestamp` and `artists` are definitely necessary for data collection, while `available_markets` and actions is not. Since the JSON data is represented as a dict in Python, we just need to access the key/value pairs we want to keep and transfer them over to another dict. However, some issues do arise, since some tracks may not contain key/value pairs that others do. To make this process more fault tolerant, we can create a function that traverses a `dict` looking for a specific key/value pair given an array of keys. It returns the found value, or `None` if it isn’t found.

```python
def dict_get(d, path):
    for item in path:
    d = d.get(item)
    if d is None:
        return None
    return d
```

## Saving Data

When it comes to saving the data we’ve collected, we can use a Redis key/value database (looking back, it might have been better to use MongoDB in order to take advantage of document databases, since the data we’re collected is JSON). This requires `redis-py`, a Python API for accessing Redis. To open a connection to the database, all we need to do is create an instance of a the `StrictRedis` object with an appropriate host and database number. Since Redis supports up to 16 databases by default, we will just be using db 0. From there, we can `HMSET` to create a key value pair of `listening:UTC_timestamp` and the data dict.

Before the data can be added, however, we need to convert some values in it to work with Redis. Since Redis does not support boolean values, we have to convert Python’s `True` and `False` values to 1 and 0, respectively. This can be done as follows:

```python
def redis_convert(d):
    for key, val in d.items():
    if isinstance(val, bool):
        d[key] = 1 if val else 0
    return d
```

All this does is iterate through each key value pair in the data dict, checking if the value is of type `bool`. If it is, it changes the value to be an integer instead.

And that’s the majority of the project done! We have authentication, automatic token refreshing, data parsing, collection, and then storage. Now to actually deploy it.

## Deployment

I decided to set up a Raspberry Pi 3+ to keep the script running on, mostly to keep it isolated from my regular development environment and to make sure it runs at all times. The Pi itself runs Raspbian, and from there it’s only a matter of installing dependencies. The project only uses `requests` and `redis-py`, so the installation is very simple. However, once the script is running, I do not want to have to check the Pi to make sure it hasn’t crashed or the script isn’t running because of an unforeseen reason. Because of this, I created a runner script (`run.py`) that executes the script as a subprocess. In the event that the script exits unexpectedly, the subprocess will just be restarted and continue running. Hopefully, with these systems in place, the script will be resilient enough to run 24/7 for the entire year.

I’ll see you in around 365 days ;)

The GitHub repo for this project is [located here](https://github.com/simonbukin/spotify-logger), and if you’d like to track my Spotify history yourself, you’ll find [my profile here](https://open.spotify.com/user/simonb.0?si=3087e41d27214c11).
