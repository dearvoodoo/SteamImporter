﻿var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
function doCORSRequest(options, printResult) {
	var x = new XMLHttpRequest();
	x.open(options.method, cors_api_url + options.url);
	x.onload = x.onerror = function() {
		printResult(x.responseText || '');
	};
    x.send(options.data);
};

function matcher(regexp) {
	return function (obj) {
		var found = false;
		Object.keys(obj).forEach(function(key){
			if ( ! found) {
      			if ((typeof obj[key] == 'string') && regexp.exec(obj[key])) {
        			found = true;
      			}
    		}
  		});
  		return found; // Game found
  	};
}

function getID(game) {
	doCORSRequest({
		method: "GET",
		url: "https://api.steampowered.com/ISteamApps/GetAppList/v2",
		data: "",
	},
	function printResult(data) {
		var data = JSON.parse(data);
		
		$("#searching").empty();
		$("#searching").addClass("badge-info");
		$("#searching").removeClass("badge-danger");
		$("#searching").html('Searching for: %s'+ game);
		
		var re1 = new RegExp("\\b" + game + "\\b", 'i');
		var a = data["applist"]["apps"]
		var matches = a.filter(matcher(re1));
		
		$("#searching").html('Found '+ matches.length +' result.');
		$("#button-addon2").html("Get Game");
		
		$('#matchesList').empty();
		
		matches.forEach(function(result) {
			$('#matchesList').append("<button class='btn btn-secondary' type='button' href='#' onclick='getInfo("+result.appid+")'>"+ result.name +"</button>")
		})
	})
};

function reset_lines(fa) {
	$("#name").html(fa)
	$("#appID").html(fa)
	$("#developers").html(fa)
	$("#publishers").html(fa)
	$("#price").html(fa)
	$("#platforms").html(fa)
	$("#release_date").html(fa)
	$("#pegi").html(fa)
	$("#short_desc").html(fa)
	$("#long_desc").html(fa)
	$("#supported_languages").html(fa)
	$("#categories").html(fa)
	$("#genres").html(fa)
	$("#legal_notice").html(fa)
	$("#pc_requirements_min").html(fa)
	$("#pc_requirements_rec").html(fa)
	$("#mac_requirements_min").html(fa)
	$("#mac_requirements_rec").html(fa)
	$("#linux_requirements_min").html(fa)
	$("#linux_requirements_rec").html(fa)
}

function getInfo(ID) {
	reset_lines("<i class='fal fa-spinner fa-spin'></i>")
	$('#button-addon2').html('<i class=\'fal fa-spinner fa-spin\'></i>')
	doCORSRequest({
		method: "GET",
		url: "http://store.steampowered.com/api/appdetails/?appids="+ID+"&l=french",
		data: "",
	},
	function printResult(data) {
		var data = JSON.parse(data);
		var gameID = ID.toString()
		var data = data[gameID];
		
		if (data.success==true) {
			$("#button-addon2").html("Get Game")
			$("#searching").html("")
			$("#searching").addClass("badge-info");
			$("#searching").removeClass("badge-danger");
			
			var nothing = "<i class='fal fa-times' style='color: red;'></i>"
			var details = data.data
			//console.log(details)
			
			// Nom du jeu
			var name = details.name
			if (name != null && name != 'undefined') {
				addText(name, "name");
			} else { 
				addText(nothing, "name");
			}
			
			// ID Du jeu
			var appID = '<a href="https://store.steampowered.com/app/'+details.steam_appid+'" target="_blank">'+details.steam_appid+'</a>'
			if (details.steam_appid != null && details.steam_appid != 'undefined') {
				addText(appID, "appID");
			} else { 
				addText(nothing, "appID");
			}
			
			// Date de sorti + Prix
			var release_date = details.release_date
			if (release_date != null && release_date != 'undefined') {
				var date = release_date.date
				addText(date, "release_date")
			
				if (release_date.coming_soon==true) {
					addText("Coming Soon", "price");
				} else {
					var is_free = details.is_free
					if (is_free==false) {
						var price_overview = details.price_overview
						var initial_formatted = price_overview.initial_formatted
						var final_formatted = price_overview.final_formatted
						var discount_percent = "-" + price_overview.discount_percent + "%"
				
						if (price_overview.discount_percent==0) {
							var finalPrice = final_formatted
							addText(finalPrice, "price");
						} else {
							var finalPrice = "<h4><strike>"+initial_formatted+"</strike> "+final_formatted+" <span class='badge badge-success'>"+discount_percent+"</span></h4>"
							addText(finalPrice, "price");
						}
					} else {
						var finalPrice = "F2P"
						addText(finalPrice, "price");
					}
				}
			} else { 
				addText(nothing, "release_date");
				addText(nothing, "price");
			}
			
			// Long description
			var about_the_game = details.about_the_game
			if (about_the_game != null && about_the_game != 'undefined') {
				addText(about_the_game, "long_desc");
			} else { 
				addText(nothing, "long_desc");
			}
			
			// Courte description
			var short_description = details.short_description
			if (short_description != null && short_description != 'undefined') {
				addText(short_description, "short_desc");
			} else { 
				addText(nothing, "short_desc");
			}
			
			// Langues
			var supported_languages = details.supported_languages
			if (supported_languages != null && supported_languages != 'undefined') {
				addText(supported_languages, "supported_languages");
			} else { 
				addText(nothing, "supported_languages");
			}
			
			// Dev
			var developers = details.developers
			if (developers != null && developers != 'undefined') {
				addText(developers, "developers");
			} else { 
				addText(nothing, "developers");
			}
			
			// Editeur
			var publishers = details.publishers
			if (publishers != null && publishers != 'undefined') {
				addText(publishers, "publishers");
			} else { 
				addText(nothing, "publishers");
			}
			
			// Platformes
			var platforms = details.platforms
			if (platforms != null && platforms != 'undefined') {
				if (platforms.windows==true){
					var windows = "Windows"
				} else {
					var windows = " "
				}
				if (platforms.mac==true){
					var mac = "Mac"
				} else {
					var mac = " "
				}
				if (platforms.linux==true){
					var linux = "Linux"
				} else {
					var linux = " "
				}
				var plat = windows + mac + linux
				addText(plat, "platforms")
			} else { 
				addText(nothing, "platforms");
			}
			
			//PEGI
			var required_age = details.required_age // 3 7 12 16 18
			if (required_age != null && required_age != 'undefined') {
				addText(required_age.toString(), 'pegi')
			} else { 
				addText(nothing, "pegi");
			}
			
			// Screenshots
			var screenshots = details.screenshots
			if (screenshots != null && screenshots != 'undefined') {
				$("#images_list").empty();
				screenshots.forEach(function(result) { 
					var img_00 = "<div class='col-lg-3 col-md-4 col-6'><a class='d-block mb-4 h-100' href='"
					var img_01 = "' download><img class='img-fluid' src='"
					var img_02 = "'></a></div>"
					$("#images_list").append(img_00 + result.path_full + img_01 + result.path_full + img_02)
					//console.log(result.path_full) 
				})
			}
			
			// Catégories
			var categories = details.categories
			if (categories != null && categories != 'undefined') {
				$('#categories').empty();
				categories.forEach(function(result){
					var cate = result.description + "<br>"
					$('#categories').append(cate);
				})
			} else { 
				$('#categories').append(nothing);
			}
			
			// Genres
			var genres = details.genres
			if (genres != null && genres != 'undefined') {
				$('#genres').empty();
				genres.forEach(function(result){
					var genre = result.description + "<br>"
					$('#genres').append(genre);
				})
			} else {
				$('#genres').append(nothing);
			}
			
			// Copy
			var legal_notice = details.legal_notice
			if (legal_notice != null && legal_notice != 'undefined') {
				addText(legal_notice, 'legal_notice')
			} else { 
				addText(nothing, "legal_notice");
			}
			
			// Requirements
			var pc_requirements = details.pc_requirements
			if (pc_requirements != null && pc_requirements != 'undefined') {
				var pc_min = pc_requirements.minimum
				addText(pc_min,'pc_requirements_min')
				var pc_rec = pc_requirements.recommended
				addText(pc_rec,'pc_requirements_rec')
			} else { 
				addText(nothing,'pc_requirements_min')
				addText(nothing,'pc_requirements_rec')
			}
			
			var mac_requirements = details.mac_requirements
			if (mac_requirements != null && mac_requirements != 'undefined') {
				var mac_min = mac_requirements.minimum
				addText(mac_min,'mac_requirements_min')
				var mac_rec = mac_requirements.recommended
				addText(mac_rec,'mac_requirements_rec')
			} else { 
				addText(nothing,'mac_requirements_min')
				addText(nothing,'mac_requirements_rec')
			}
			
			var linux_requirements = details.linux_requirements
			if (linux_requirements != null && linux_requirements != 'undefined') {
				var linux_min = linux_requirements.minimum
				addText(linux_min,'linux_requirements_min')
				var linux_rec = linux_requirements.recommended
				addText(linux_rec,'linux_requirements_rec')
			} else { 
				addText(nothing,'linux_requirements_min')
				addText(nothing,'linux_requirements_rec')
			}
			
		} else {
			$('#button-addon2').html('Get Game')
			reset_lines("<i class='fal fa-times' style='color: red;'></i>")
			$("#searching").html('No informations for this game.');
			$("#searching").removeClass("badge-info");
			$("#searching").addClass("badge-danger");
		}
	})
};

function addText(text, id) {
	$('#'+id).empty();
	$('#'+id).append(text);
};

$(function(){
  $('#GameName').keypress(function(e){
    if(e.which == 13) {
		$('#button-addon2').html('<i class=\'fal fa-spinner fa-spin\'></i>')
      	getID($('#GameName').val());
    }
  })
})

function copyToClipboard(elementId) {
  	var aux = document.createElement("input");
  	aux.setAttribute("value", $(elementId).html());
  	document.body.appendChild(aux);
  	aux.select();
  	document.execCommand("copy");
  	document.body.removeChild(aux);
}

$(function(){
  $('#YTThumb').keypress(function(e){
    if(e.which == 13) {
		$('#button-addon3').html('<i class=\'fal fa-spinner fa-spin\'></i>')
      	getThumb($('#YTThumb').val());
    }
  })
})

function getThumb(url) {
	var id = YouTubeGetID(url)
	var ThumbLink = "http://i3.ytimg.com/vi/"+id+"/maxresdefault.jpg"
	var img_00 = "<div class='col-lg-3 col-md-4 col-6'><a class='d-block mb-4 h-100' href='"
	var img_01 = "' download><img src='"
	var img_02 = "'></a></div>"
	$("#YT_THUMB_HERE").empty();
	$("#YT_THUMB_HERE").append(img_00 + ThumbLink + img_01 + ThumbLink + img_02);
}

function YouTubeGetID(url){
   url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
   return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}
//http://i3.ytimg.com/vi/15kWOUE6P-k/maxresdefault.jpg