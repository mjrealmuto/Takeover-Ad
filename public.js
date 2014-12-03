(function ($) {
	"use strict";
	$(function () {
		// Place your public-facing JavaScript here
		
		// get current date obj.
		var d = new Date( );
		
		//Get Date Variables to be passed through ajax
		var year 	= d.getYear( ) + 1900;
		var month 	= d.getMonth( ) + 1;
		var day		= d.getDate( );
		
		//Get Time variables to be passed through ajax
		var hour 	= d.getHours( );
		var minute	= d.getMinutes( );
		
		//pull URL 
		var url		= location.href;
		
		//Split URL by '?'
		var q_str   = url.split("?");
		
		var takeover_id = "";
		
		/* Check length of q_str if the length is greater than 1
		 *	begin to extract the parameters passed into the querystring
		 */
		if( q_str.length > 1 )
		{
			//Split querystring by '&' to extract arguments
			var q_str_params = q_str[1].split("&");
			
			var url = "";
			
			//See if there are any arguements to extract
			if( q_str_params.length == 1 )
			{
				//Split argument by '=' to separate key/value
				var key_value = q_str[1].split("=");
				
				//Check if any of the keys are to be used in the takeover
				switch( key_value[0] )
				{
					//case takeover_test_date format YYYY-MM-DD
					case "takover_testdate":
						var takeover_date = key_value[1].split("-");					
					
						year 	= takeover_date[0];
						month 	= takeover_date[1];
						day		= takeover_date[2];
					
					break;
					//case test time format HH:SS
					case "takeover_testtime":
						var takeover_time = key_value[1].split(":");
						
						hour 	= takeover_time[0];
						minute	= takeover_time[1];
						
					break
					//case ID
					case "takeover_id":
						takeover_id = key_value[1];
					break;
				}
			}
			else if ( q_str_params.length > 1 ) //More than one parameter in the querystring
			{
				//Loop through the parameters
				for( var i = 0 ; i < q_str_params.length ; i++ )
				{
										
					//Split the parameter by '='
					var key_value = q_str_params[i].split("=");
					
					//Check to see what parameters are being checked in 
					switch( key_value[0] )
					{
						case "takeover_testdate": //Testing Date (usually goes with time)
							var takeover_date = key_value[1].split("-");					
						
							year 	= takeover_date[0];
							month 	= takeover_date[1];
							day		= takeover_date[2];
						
						break;
						case "takeover_testtime": //Testing Time (usually goes with date)
							var takeover_time = key_value[1].split(":");
							
							hour 	= takeover_time[0];
							minute	= takeover_time[1];
							
						break
						case "takeover_id": //Testing by ID
							takeover_id = key_value[1];
						break;
					}
				}
			}
		}
		
		//If takeover_id is empty then use the date time variables else use ID
		if( takeover_id == "" )
		{
			url = "/wp-admin/admin-ajax.php?year=" + year + "&month=" + month + "&day=" + day + "&hour=" + hour + "&minute=" + minute + "&action=get_takeover";
		}
		else
		{
			url = "/wp-admin/admin-ajax.php?id=" + takeover_id + "&action=get_takeover";
		}
		
		//AJAX Call to get takeover information
		 $.ajax({
			url : url,
			type : "GET",
			dataType : "json",
			success: function( data )
			{
				//Check if the takeover object returned is TRUE if so, process and display takeover
				if( data.takeover == true )
				{
					var id			= data.id; //ID of takeover -> primarily used to update counts
					var name		= data.name; //Takeover Name
					var background  = data.background; //Background Image
					var clickable 	= data.clickable; //If background is clickable
					var link		= data.link; //Link to beused
					var bg_color	= data.bg_color; //Hex value background color
					var keep_still	= data.keep_still; //Whether the background should be kept still or moved with the page
					var target		= data.target; //Link target: _SELF or _BLANK
					var hide_header = data.hide_header; //Tell whether or not to hide the header
					var v1_ad		= data.vert_one; //Vertical one ad
					var v2_ad		= data.vert_two; //Vertical two ad
					var bl_ad		= data.bott_left; //Bottom Left Ad
					var bc_ad		= data.bott_center; //Bottom Center Ad
					var br_ad		= data.bott_right; //Bottom Right Ad 
					
					if( bg_color.match( /^#/ ) === null)
					{
						bg_color = "#" + bg_color;
					}
										//Set style for body.
					$("body").css({
						background : 'url(' + background + ') no-repeat fixed',
						backgroundColor : bg_color,
						backgroundSize : "canvas",
						backgroundPosition : "top center"
					});
					
					/*
					* Check if clickable is true					
					*	IF TRUE - set up div clickable elements to be set up on either side of the content
					*   Bind events and change styling based on the screen size.
					*/
					if( parseInt( clickable ) == 1 )
					{
						$("body").append("<div id='left_side_click'></div>"); //Set up left click element
						$("body").append("<div id='right_side_click'></div>"); //Set up right click element
					
						//Retreive header position
						var position = $("header").position( );
						
						var offset = $("header").offset( );
						
						
						//Set width of both side elements based on the left position of the header
						$("#left_side_click, #right_side_click").css("width",offset.left);
					
						//Bind Mousever, Mouseout and Click events to the side elements
						$("#left_side_click, #right_side_click").on({
							mouseover: function( ){
								$(this).css("cursor","pointer"); //Change cursor to pointer when moused over				
							},
							mouseout: function( ){
								$(this).css("cursor","auto"); //Chnage cursor back to auto when moused out
							},
							click: function( ){
								
								//AJAX Call for updating clicks on background
								
								/*
								* When clicked check what the target is
								* If self open in same window
								* else open in new window
								*/
								
								if( target == "self" )
								{
									_gaq.push(['_trackEvent','Takeover Side Click - ' + name, 'Click']);
									setTimeout(function( ){window.location.href = link;}, 400);			
								}
								else
								{
									_gaq.push(['_trackEvent','Takeover Side Click - ' + name, 'Click', link]);
									setTimeout(function( ){window.open(link,'','','');}, 400);
									
								}
							}
						});
						
						if( parseInt( hide_header ) )
						{
							$("header").css("visibility", "hidden");
						}
						
						// bind resizing the window to adjusting side divs.
						$(window).resize( function( )
						{
							var offset = $("header").offset( );
							$("#left_side_click, #right_side_click").css("width",offset.left);
						});
					}
						
					//Replace side and bottom ads - if necessary.
					
					if( v1_ad != "" || v1_ad !== null )
					{
						$("#acm_ad_zones-2 > div.widget-container").fadeOut( );
						
						$("#acm_ad_zones-2 > div.widget-container").html("");
						
						$("#acm_ad_zones-2 > div.widget-container").append( "<img id='takeover_vert_1_ad' src='" + v1_ad + "' />" ).fadeIn( );
						
						$("#takeover_vert_1_ad").on({
							
							mouseover: function( )
							{
								$(this).css('cursor','pointer');
							},
							mouseout: function( )
							{
								$(this).css('cursor','auto');
							},
							click: function( )
							{
								if( target == "self" )
								{
									_gaq.push(['_trackEvent','Takeover Vertical Ad 1 - ' + name, 'Click']);
									setTimeout(function( ){window.location.href = link;}, 400);					
								}
								else
								{
									_gaq.push(['_trackEvent','Takeover Vertical Ad 1 - ' + name, 'Click', link]);
									setTimeout(function( ){window.open(link,'','','');}, 400);
								}
							}
						});
					}
					
					if( v2_ad != "" || v2_ad !== null)
					{
						$("#acm_ad_zones-3 > div.widget-container").fadeOut( );
						
						$("#acm_ad_zones-3 > div.widget-container").html("");
						
						$("#acm_ad_zones-3 > div.widget-container").append( "<img id='takeover_vert_2_ad' src='" + v2_ad + "' />" ).fadeIn( );
						
						$("#takeover_vert_2_ad").on({
							
							mouseover: function( )
							{
								$(this).css('cursor','pointer');
							},
							mouseout: function( )
							{
								$(this).css('cursor','auto');
							},
							click: function( )
							{
								if( target == "self" )
								{
									_gaq.push(['_trackEvent','Takeover Vertical Ad 2 - ' + name, 'Click']);
									setTimeout(function( ){window.location.href = link;}, 400);					
								}
								else
								{
									_gaq.push(['_trackEvent','Takeover Vertical Ad 2 - ' + name, 'Click', link]);
									setTimeout(function( ){window.open(link,'','','');}, 400);
								}
							}
						});
					}
					
					if( bl_ad != "" || bl_ad !== null )
					{
						$("#acm_ad_zones-6 > div.footer-widget-container").fadeOut( );
						
						$("#acm_ad_zones-6 > div.footer-widget-container").html("");
						
						$("#acm_ad_zones-6 > div.footer-widget-container").append( "<img id='takeover_bottom_left_ad' src='" + bl_ad + "' />" ).fadeIn( );
						
						$("#takeover_bottom_left_ad").on({
							
							mouseover: function( )
							{
								$(this).css('cursor','pointer');
							},
							mouseout: function( )
							{
								$(this).css('cursor','auto');		
							},
							click: function( )
							{
								if( target == "self" )
								{
									_gaq.push(['_trackEvent','Bottom Left Ad - ' + name, 'Click']);
									setTimeout(function( ){window.location.href = link;}, 400);					
								}
								else
								{
									_gaq.push(['_trackEvent','Bottom Left Ad - ' + name, 'Click', link]);
									setTimeout(function( ){window.open(link,'','','');}, 400);
								}
							}
						});
					}
					
					if( bc_ad != "" || bc_ad !== null )
					{
						$("#acm_ad_zones-5 > div.footer-widget-container").fadeOut( );
						
						$("#acm_ad_zones-5 > div.footer-widget-container").html("");
						
						$("#acm_ad_zones-5 > div.footer-widget-container").append( "<img id='takeover_bottom_center_ad' src='" + bc_ad + "' />" ).fadeIn( );
						
						$("#takeover_bottom_center_ad").on({
							
							mouseover: function( )
							{
								$(this).css('cursor','pointer');
							},
							mouseout: function( )
							{
								$(this).css('cursor','auto');		
							},
							click: function( )
							{
								if( target == "self" )
								{
									_gaq.push(['_trackEvent','Bottom Center Ad - ' + name, 'Click']);
									setTimeout(function( ){window.location.href = link;}, 400);					
								}
								else
								{
									_gaq.push(['_trackEvent','Bottom Center Ad - ' + name, 'Click', link]);
									setTimeout(function( ){window.open(link,'','','');}, 400);
								}
							}
						});
					}
					
					if( br_ad != "" || br_ad !== null )
					{
						$("#acm_ad_zones-4 > div.footer-widget-container").fadeOut( );
						
						$("#acm_ad_zones-4 > div.footer-widget-container").html("");
						
						$("#acm_ad_zones-4 > div.footer-widget-container").append( "<img id='takeover_bottom_right_ad' src='" + br_ad + "' />" ).fadeIn( );
						
						$("#takeover_bottom_right_ad").on({
							
							mouseover: function( )
							{
								$(this).css('cursor','pointer');
							},
							mouseout: function( )
							{
								$(this).css('cursor','auto');		
							},
							click: function( )
							{
								if( target == "self" )
								{
									_gaq.push(['_trackEvent','Bottom Right Ad - ' + name, 'Click']);
									setTimeout(function( ){window.location.href = link;}, 400);					
								}
								else
								{
									_gaq.push(['_trackEvent','Bottom Right Ad - ' + name, 'Click', link]);
									setTimeout(function( ){window.open(link,'','','');}, 400);
								}
							}
						});
					}

					//Change .background-cover to reflect body.
					//$(".background-cover").fadeOut('5000', function( )
					//{
					
						$(".background-cover").css({
							background : 'url(' + background + ') no-repeat fixed',
							backgroundColor : bg_color,
							backgroundSize : "canvas",
							backgroundPosition : "top center"

						});
						
						//$(".background-cover").fadeOut('fast');
					//});
				}
			}
		});
	});
}(jQuery));

