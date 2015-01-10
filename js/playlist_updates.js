// Define some variables used to remember state.
var playlistId = 'PLyDoEZ08Zam3n_bPBi2ylc_NZV--spj5_';
var channelId;
var playlistArray;
var counter;

// After the API loads, call a function to enable the playlist creation form.
function handleAPILoaded() {
  enableForm();
}

// Enable the form for creating a playlist.
function enableForm() {
  $('#update-playlist-btn').attr('disabled', false);
}

function updatePlaylist() {
  $('#status').hide();
  playlistArray = [];
  console.log('Array =' + playlistArray);
  parsePlaylist();
}

// Iterates through the videos on "My Subscription" page and compares them against the playlist.
// If the video exists in both lists it returns true, otherwise it returns false. 
function checkForDuplicates(playlistVideos, video) {
  if (playlistVideos.indexOf(video) > -1) {
    return true; 
  } else {
    return false;
  }
}

// Parse all the video IDs from the daily playlists so that we can check for duplicates
function parsePlaylist() {
     $.getJSON('https://gdata.youtube.com/feeds/api/playlists/PLyDoEZ08Zam3n_bPBi2ylc_NZV--spj5_/?v=2&alt=json&format=5&max-results=50', function(data) {
       var feed = data.feed;
       var entries = feed.entry || [];
       var urlIds = [];
       for (var i = 0; i < entries.length; i++) {
         var entry = entries[i];
         urlIds.push(entry['media$group']['yt$videoid']['$t']); 
       }
       playlistArray = urlIds;
       parseSubscription();
   });
}

function showPlayer() {
    return function() {
        $('#update-playlist-btn').attr('disabled', true);
		counter = 60;
        id = setInterval(function() {
            counter--;
            if(counter < 0) {
                $('#update-playlist-btn').attr('disabled', false);
				$('#update-playlist-btn').html("ok update time");
                clearInterval(id);
            } else {
                $('#update-playlist-btn').html("Wait " + counter.toString() + " seconds");
            }
        }, 1000);
    
        $('.youtube-player').html('<iframe id="playlist-iframe" width="100%" height="600" src="//www.youtube.com/embed/videoseries?list=PLyDoEZ08Zam3n_bPBi2ylc_NZV--spj5_" frameborder="0" allowfullscreen></iframe>');
        $('.youtube-player').fadeIn('slow');
    }
}

// Parse the subscription feed so that we only grab the video IDs. 
function parseSubscription() {
   $.getJSON('https://gdata.youtube.com/feeds/api/users/sofakingeuro/newsubscriptionvideos?v=2&alt=json&format=5&max-results=10', function(data) {
       var feed = data.feed;
       var entries = feed.entry || [];
       var urlIds = [];
       for (var i = 0; i < entries.length; i++) {
         var entry = entries[i];
         urlIds.push(entry['media$group']['yt$videoid']['$t']); 
       }

       for (var x = 0; x < urlIds.length; x++) {
         console.log(urlIds[x]);
         if (!checkForDuplicates(playlistArray, urlIds[x])) {
           addToPlaylist(urlIds[x]);
         }
         
         if (x == urlIds.length-1) {
           setTimeout( showPlayer(), 1000);
         }
       }
    });
}

// Add a video ID specified in the form to the playlist.
function addVideoToPlaylist(id) {
  addToPlaylist(id.val());
}

// Add a video to a playlist. The "startPos" and "endPos" values let you
// start and stop the video at specific times when the video is played as
// part of the playlist. However, these values are not set in this example.
function addToPlaylist(id, startPos, endPos) {
  var details = {
    videoId: id,
    kind: 'youtube#video'
  }
  if (startPos != undefined) {
    details['startAt'] = startPos;
  }
  if (endPos != undefined) {
    details['endAt'] = endPos;
  }
  var request = gapi.client.youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: details
      }
    }
  });
    
  request.execute(function(response) {
    $('#status').html('<pre>New Song(s) Added</pre>');
    $('#status').show();
  });
}
