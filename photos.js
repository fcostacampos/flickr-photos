/*global jQuery*/
document.cookie = "";
document.cookie = null;

var setupPhotos = (function ($) {

    	var favorites;
		var dividerImage = "||";
		var dividerAttribute = "$$";
		var daysOfCookie = 1;

		function setCookie(cookieName, value, expirationDays)
		{
			var expirationDate = new Date();
			expirationDate.setDate(expirationDate.getDate() + expirationDays);
			var cookieValue = escape(value) + ((expirationDays == null) ? "" : "; expires = " + expirationDate.toUTCString());
			document.cookie = cookieName + "=" + cookieValue;
		}

		function getCookie(cookieName)
		{
			var i,x,y,mCookies = document.cookie.split(";");
			for (i = 0; i < mCookies.length; i++)
			{
			  x = mCookies[i].substr(0, mCookies[i].indexOf("=")); // cookie name
			  y = mCookies[i].substr(mCookies[i].indexOf("=")+1); // cookie value
			  x = x.replace(/^\s+|\s+$/g,""); // strip leading and trailing spaces
			  if (x == cookieName)
		    {
		    	return unescape(y);
		    }
		  }
		}

		function initializeCookies()
		{
			var favoritesCookie = getCookie("favorites");
			if (favoritesCookie !=null && favoritesCookie != "")
			{
				favorites = favoritesCookie;
			}
			else
			{
				setCookie("favorites","",daysOfCookie);
				favorites = "";
			}
		}

		function UpdateHeart(id, state)
		{
			if (state == "1")
				document.getElementById(id).setAttribute("class", "icon-heart");
			else
				document.getElementById(id).setAttribute("class", "icon-heart-empty");
		}

		function GetImageClass(id)
		{

			var imageClass = 'icon-heart-empty';
			if (favorites != "")
			{
				var favoriteImages = favorites.split(dividerImage);

				for (i = 0; i < favoriteImages.length; i++)
				{

					var imageState = favoriteImages[i].split(dividerAttribute);
					if (id == imageState[0])
					{
						if (imageState[1] == "1")
							imageClass = 'icon-heart';

						break;
					}
				}
			}

			return imageClass;
		}

		function changeState(id)
		{
			var newState = "1";
			var newFavorites = "";
			if (favorites != "")
			{
				var favoriteImages = favorites.split(dividerImage);

				for (i = 0; i < favoriteImages.length; i++)
				{
					var imageState = favoriteImages[i].split(dividerAttribute);
					if (id == imageState[0])
					{
						if (imageState[1] == "1")
						{
							newState = "0";
						}
						else
						{
							newState = "1";
						}
					}
					else
					{
						if (newFavorites != "")
						{
							newFavorites += dividerImage;
						}
						newFavorites += favoriteImages[i];
					}
				}
			}
			if (newFavorites != "")
			{
				newFavorites += dividerImage;
			}
			newFavorites += id + dividerAttribute + newState;
			UpdateHeart(id, newState);

			favorites = newFavorites;
			setCookie("favorites", favorites, daysOfCookie);
		}


    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function imageAppender (id) {

        var holder = document.getElementById(id);
        return function (img) {

            var elm = document.createElement('div');
            elm.className = 'photo';
            elm.appendChild(img);

						var icon = document.createElement('i');
						icon.className = GetImageClass(img.src);
						icon.id = img.src;

						var iconArea = document.createElement('div');
						iconArea.className = 'iconArea';
						iconArea.onclick = function () {
            	changeState(img.src);
						};

						iconArea.appendChild(icon);

            var imgArea = document.createElement('div');
        		imgArea.className = 'photoArea';
        		imgArea.appendChild(elm);

        		imgArea.appendChild(iconArea);

            holder.appendChild(imgArea);

        };
    }

    // ----

    var max_per_tag = 5;
    return function setup (tags, callback) {
				initializeCookies();
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));


