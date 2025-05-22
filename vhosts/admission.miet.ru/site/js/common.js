$(document).ready(function() {

	//E-mail Ajax Send
	$("form").submit(function() { //Change
		var th = $(this);
		$.ajax({
			type: "POST",
			url: "mail.php", //Change
			data: th.serialize()
		}).done(function() {
			alert("Thank you!");
			setTimeout(function() {
				// Done Functions
				th.trigger("reset");
			}, 1000);
		});
		return false;
	});

	$("#gallery-grid").mixItUp({
		controls: {
			live: true
		}
	});

	$(".s_portfolio li").click(function() {
		$(".s_portfolio li").removeClass("active");
		$(this).addClass("active");
	});


		function heightDetect() {
		$(".main-head").css("height", $(window).height());
	};
	heightDetect();
	$(window).resize(function() {
		heightDetect();
	});


$('.open-popup-link').magnificPopup({
  type:'inline',
  midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
});

	$(".gallery-item").each(function(i) {
		$(this).find("a").attr("href", "#photo_" + i);
		$(this).find(".podrt_descr").attr("id", "photo_" + i);
	});

	$(".popup").magnificPopup({type:"image"});
	$(".popup_content").magnificPopup({
		type:"inline",
		midClick: true
	});
	
	$(".sections_portal_wrap ul a").mPageScroll2id();
	
});

$(window).load(function() {

	$(".loader_inner").fadeOut();
	$(".loader").delay(450).fadeOut("slow");

	$(".top-left-text").animated("fadeInLeft", "fadeOutLeft");
	$(".top-right-text").animated("fadeInRight", "fadeOutRight");

	$(".s-header").animated("fadeInDown", "fadeOutUp");
	$(".howto-header").animated("fadeInDown", "fadeOutUp");
	$(".gallery-header").animated("fadeInDown", "fadeOutUp");
	$(".contacts-header").animated("fadeInDown", "fadeOutUp");
	$(".line-1").animated("fadeIn", "fadeOut");
	$(".icons").animated("flipInY", "flipOutY");
	$(".line-2").animated("fadeInRight", "fadeOutLeft");
	$(".line-3").animated("fadeIn", "fadeOut");
	$(".info-box").animated("fadeIn", "fadeOut");

	$(".how-to-cont-title").animated("flipInX", "flipOutX");
	$(".icon-terms").animated("zoomIn", "zoomOut");
	$(".info-box").animated("fadeInRight", "fadeOutRight");
	$(".warn").animated("bounceIn", "fadeOut");

	$(".site_miet").animated("fadeIn", "fadeOut");
	$(".address").animated("zoomIn", "zoomOut");
	$(".cont-1").animated("fadeInLeft", "fadeOutRight");
	$(".cont-2").animated("fadeInRight", "fadeOutLeft");


	$('#gallery').photobox('a',{ time:0 });
	$('#gallery').photobox('li > a.family',{ time:0 }, callback);

	function callback(){
		console.log('image has been loaded');
	}
	$('#gallery').photobox('destroy');
	$('#gallery').photobox('prepareDOM');

});