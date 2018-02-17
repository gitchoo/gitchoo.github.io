$.easing.easeOutBounce = function (x, t, b, c, d) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}

$.fn.isOnScreen = function(){
	var element = this.get(0);
	var bounds = element.getBoundingClientRect();
	if (bounds.top < window.innerHeight && bounds.bottom > 0){
		var osc_threshold = this.data('osc') == undefined ? 70 : Number(this.data('osc'));
		var y1 = bounds.top <= 0 ? 0 : bounds.top;
		var y2 = (bounds.top + bounds.height > window.innerHeight) ? 
			y1 + (window.innerHeight - bounds.top) :
			bounds.top + bounds.height;
		var p = ((y2 - y1) / bounds.height) * 100; 
		if (p > osc_threshold) return true;
	}
	return false;
}




$(function(){

	$(window).bind('resize', function(){
		setTimeout(function(){ 
			resizeHandler();
		}, 200);
	});

	$('#frm_email').bind('submit',function(e){
		e.preventDefault();
		sendmail();
		return false;
	});

	createTechscape();

	$(window).bind('scroll', checkVisibleElements);

	$('#lightbox .btn_close').bind('click', function(){
		$('#lightbox').fadeOut(300);
	});

});

function resizeHandler(){
	$('.section.grid').each(function(){
		var w = $(this).width();

		$(this).find('.item.masonry').each(function(i){
			var col = Math.floor(w / $(this).width());
			var row = Math.floor(i / col);
			$(this).attr('data-col', col);
			$(this).attr('data-row', row);
		});
	});
}


function checkVisibleElements(){

	$('.osc').each(function(){
		var obj = $(this);
		if ($(this).isOnScreen()){
			if (obj.hasClass('osc_show')) return;
			obj.addClass('osc_show');

			obj.find('.osc_item').addClass('osc_show');
			switch(obj.data('section')){
				case 'techscape':
					animateTechscape();
					break;
				default:
					break;
			}
		}
	});
}

function createTechscape(){
	var items = [
		{ label:'C#', icon:'csharp', color:'9A4993', rating:8 },
		{ label:'MySQL', icon:'mysql', color:'F9954D', rating:7 },
		{ label:'PHP', icon:'php', color:'627DBE', rating:6 },
		{ label:'JS', icon:'js', color:'83BD37', rating:9 },
		{ label:'HTML', icon:'html', color:'E44D26', rating:9 },
		{ label:'CSS', icon:'css', color:'1F72B5', rating:9 },
		{ label:'SASS3 (SCSS)', icon:'sass', color:'8CC84B', rating:8 },
		{ label:'Windows IIS', icon:'windows', color:'0078D6', rating:7 },
		{ label:'Google Cloud', icon:'gcp', color:'F6B616', rating:6 },
		{ label:'Photoshop', icon:'aps', color:'8EC2FA', rating:9.5 },
		{ label:'Illustrator', icon:'aai', color:'F3AB3A', rating:7 },
		{ label:'After Effects', icon:'aae', color:'CF96FE', rating:6 },
		{ label:'Premier', icon:'apr', color:'D454FB', rating:7 },
		{ label:'Flash', icon:'afl', color:'D0170F', rating:9 },
		{ label:'Dreamweaver', icon:'adw', color:'84E30B', rating:7 },
	];

	for(var k in items){
		var i = items[k];
		i.icon = 'images/icons/ico-' + i.icon +'.png';
		var obj = $('<div class="item" data-label="' + i.label + '" data-color="' + i.color + '"></div>');
		obj.append('<div class="inner floor" data-value="' + i.rating + '"><div class="tip">'+ i.label + '</div></div>');
		obj.append('<div class="icon"><div class="wrap" style="background-image:url(' + i.icon + ');"><img src="' + i.icon + '"/></div></div>');
		obj.hover(function(e){
			if (e.type === 'mouseenter'){
				var c = $(this).attr('data-color');
				$(this).find('.inner').css('border-color', '#' + c);	
			} else{
				$(this).find('.inner').css('border-color', '');
			}
			
		})
		$('.panel[data-section="techscape"] .canvas').first().append(obj);
	}
}

function animateTechscape(){
	$('.panel[data-section="techscape"] .canvas .item').each(function(i){
		var obj = $(this).find('.inner');

		obj.clearQueue()
		.finish()
		.removeClass('ready')
		.css('height', 0)
		.delay(i * 150)
		.animate(
			{ height: (Number(obj.data('value')) * 10) + '%'}, 
			{ duration:1200, easing:'easeOutBounce' , 
			complete:function(){ $(this).addClass('ready'); }
		});

		$(this)
		.clearQueue()
		.finish()
		.css('opacity', 0)
		.delay(i * 150)
		.animate({ opacity:1}, 300);
	});
}

function resetTechscape(){
	$('.panel[data-section="techscape"] .canvas .item .inner').css('height', '0%');
	$('.panel[data-section="techscape"] .canvas .item').css('opacity', 0);
}


function sendmail(){
	
	$('#frm_email input[name="btn_submit"]').attr('disabled', 'disabled');
	

	$('#frm_email div[data-step="busy"]').addClass('show')


	var formData = 
	{
		action:'send',
		from_name:$('#frm_email input[name="txt_name"]').val(),
		from_email:$('#frm_email input[name="txt_email"]').val(),
		subject:$('#frm_email input[name="txt_subject"]').val(),
		message:$('#frm_email textarea[name="txt_message"]').val()
	}

	$.ajax({
		url:'http://frontier2.net/srvc/sendmail.aspx',
		action:'POST',
		data: formData,
		dataType:'json',
		success:function(d){
			if (d.result == '1'){
				$('#frm_email div[data-step="form"]').removeClass('show')
				$('#frm_email div[data-step="finale"]').addClass('show')
				return;
			}

			switch(d.code){
				case 'NO_NAME':
				case 'NO_EMAIL':
				case 'NO_MESSAGE':
				case 'NO_SUBJECT':
					$('.tip[data-tip="' + d.code + '"]').slideDown(300);
					return;
			}

			$('#frm_email div[data-step="form"]').removeClass('show')
			$('#frm_email div[data-step="error"]').addClass('show')
			return;
		},
		error:function(d){
			
		},
		complete:function(){
			$('#frm_email input[name="btn_submit"]').removeAttr('disabled');
			$('#frm_email div[data-step="busy"]').removeClass('show')
		}
	});
	
}
