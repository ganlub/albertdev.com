function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}

function gAddEvent(obj, evt, fn) {
	if (obj.addEventListener)
		obj.addEventListener(evt,fn,false);
	else if (obj.attachEvent)
		obj.attachEvent('on'+evt,fn);
}

function gRemoveEvent(obj, evt, fn) {
	if (obj.removeEventListener)
		obj.removeEventListener(evt,fn,false);
	else if (obj.detachEvent)
		obj.detachEvent('on'+evt,fn);
}

function gAddClass(el, className) {
	if(el.classList)
		el.classList.add(className);
	else
		el.className += ' ' + className;
}

function gRemoveClass(el, className) {
	if (el.classList)
		el.classList.remove(className);
	else
		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function gHasClass(el, className){
	if (el.classList)
		return el.classList.contains(className);
	else
		return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function gToggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(' ');
    var existingIndex = classes.indexOf(className);

    if (existingIndex >= 0)
      classes.splice(existingIndex, 1);
    else
      classes.push(className);

    el.className = classes.join(' ');
  }
}

function gArrayRemoveClass (el, className){
	[].forEach.call(el, function(element, index, array) {
		gRemoveClass(element, className);
	});
}

function gArrayAddClass(el, className){
	[].forEach.call(el, function(element, index, array) {
		gAddClass(element, className);
	});
}

// OP events function
;(function() {
    var throttle = function(type, name, obj) {
        /* jshint shadow:true */
        var obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init events */
    throttle ("scroll", "opScroll");
    throttle("resize", "opResize");
})();

function isIntoScreen( element ) {
    var elementTop = element.getBoundingClientRect().top,
        elementBottom = element.getBoundingClientRect().bottom;

    // console.log(element.id, elementTop, elementBottom, window.innerHeight);
    if(element.id == "about-me") return elementTop <= 50 && elementBottom >= 50;
    else if(element.id == "work") return elementTop <= 50 && elementBottom*1.2 >= window.innerHeight;
    else return elementTop <= window.innerHeight && elementBottom >= window.innerHeight-3;
}

function urlHash() {
  var hash = window.location.hash;
  var navCurrent = document.getElementsByClassName('nav__current');
  if(navCurrent.length)
    gRemoveClass(navCurrent[0], 'nav__current');

  if(!hash || hash == '#') window.location.hash = '#!';
  else if(hash == '#about-me') gAddClass(document.getElementById('menu-about-me'), 'nav__current');
  else if(hash == '#work') gAddClass(document.getElementById('menu-work'), 'nav__current');
  else if(hash == '#contact') gAddClass(document.getElementById('menu-contact'), 'nav__current');
}

// MAIN
var navBar, navBarHeight, navLimit, scrollEvt;

gAddEvent(window, 'load', function (e) {
    // Check if new cache available
    gAddEvent(window.applicationCache, 'updateready', function (e) {
      if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          console.info('New web version available');
          window.applicationCache.swapCache();
          window.location.reload();
      }
    });
});

// defer CSS loading
var cb = function() {
  var l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'styles/main.min.css';
  var h = document.getElementsByTagName('head')[0]; h.parentNode.insertBefore(l, h);
};
var raf = requestAnimationFrame || mozRequestAnimationFrame ||
    webkitRequestAnimationFrame || msRequestAnimationFrame;
if (raf) raf(cb);
else window.addEventListener('load', cb);

ready(function(){

    var tuckedMenu= document.getElementById('tuckedMenu');
    var toggleMenu = document.getElementById('toggle');
    navBar = document.getElementById('navBar');
    navBarHeight = navBar.getBoundingClientRect().height;
    navLimit = window.innerHeight - navBarHeight;

    urlHash();

    // Video
    var coverVideo = document.getElementsByTagName("video")[0];
    if (window.innerWidth >= 1024) {
      coverVideo.preload = "true";
      coverVideo.autoplay = "true";
      gAddEvent(coverVideo, 'loadeddata', function(){
        console.log("Video: loaded");
        coverVideo.play();
        gAddClass(document.body, 'loaded');
      });
    } else {
      gAddClass(document.body, 'loaded');
    }

    // Random cover sentence
    var coolSentences = [
      "Programmer - an organism that turns coffee into software.",
      "Programming is like sex. One mistake and you have to support it for the rest of your life. - Michael Sinz",
      "Talk is cheap. Show me the code. - Linus Torvalds",
      "It's not a bug. It's an undocumented feature."
    ];
    var coverSubtitle = document.getElementById('cover-subtitle');
    coverSubtitle.textContent = coolSentences[Math.floor(Math.random() * (4 - 0) + 0)];

    // Navigation & scroll
    gAddEvent(document.getElementById('toggle'), 'click', function (e) {
        gToggleClass(tuckedMenu, 'nav__open');
        gToggleClass(toggleMenu, 'x');
        navBarHeight = navBar.getBoundingClientRect().height;
        navLimit = window.innerHeight - navBarHeight;
    });

    if (window.CustomEvent) scrollEvt = new CustomEvent('opScroll');
    else scrollEvt = document.createEvent('opScroll'); //shitty IE

    gAddEvent(window, 'opScroll', function(e){
        if(window.pageYOffset > navLimit) {
            if(!gHasClass(navBar, 'nav-background'))
                gAddClass(navBar, 'nav-background');
        } else {
            if(gHasClass(navBar, 'nav-background'))
                gRemoveClass(navBar, 'nav-background');
        }

        var navCurrent = document.getElementsByClassName('nav__current');
        if(navCurrent.length)
          gRemoveClass(navCurrent[0], 'nav__current');

        if(isIntoScreen(document.getElementById('about-me'))) {
            gAddClass(document.getElementById('menu-about-me'), 'nav__current');
        } else if(isIntoScreen(document.getElementById('work'))) {
            gAddClass(document.getElementById('menu-work'), 'nav__current');
        } else if(isIntoScreen(document.getElementById('contact'))) {
            gAddClass(document.getElementById('menu-contact'), 'nav__current');
        }
    });

    gAddEvent(window, 'opResize', function(){
        navBarHeight = navBar.getBoundingClientRect().height;
        navLimit = window.innerHeight - navBarHeight;

        window.dispatchEvent(scrollEvt);
    });

    gAddEvent(window, 'hashchange', function(){
        urlHash();
    });

    console.info("Welcome");

});
