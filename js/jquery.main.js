$(document).ready( function(){
    dots();
    if(location.pathname === '/index.html' || location.pathname === '/'){
        $('#dots-canvas').css('opacity', '1');
    }
    if ( document.getElementById('navigation') ) {
        navigation();
    }
    historyAPI();
    menu();
    if ( document.getElementById('draw') ) {
        devices();
    }
    classHelper(window);
    expand();
});

function expand(){
    $('.expand').on('click', function(){
        var target = $(this).prev();
        if(target.is(':visible')){
            target.hide('slow');
            $(this).html('More')
        }
        else{
            target.show('slow');
            $(this).html('Less');
        }
    });
}

//History API//
function historyAPI() {
    if (!supports_history_api()) { return; }
    menuButtons();
    listener();
    window.onpopstate = function() {
        var location = document.location.pathname;
        var address;
        if( location == '/' ){
            address = 'index.html'
        }
        else{
            address = location.split("/").pop();
        }
        swapContent(address);
    };
}
function supports_history_api() {
    return !!(window.history && history.pushState);
}
function menuButtons(){
    $('a.historyAPIMenu').on('click', function(e){
        var address = $(this).attr('href');
        e.preventDefault();
        swapContent(address);
        history.pushState(null, null, address);
    });
}
function listener(){
    $('a.historyAPI').on('click', function(e){
        var address = $(this).attr('href');
        swapContent(address);
        e.preventDefault();
        history.pushState(null, null, address);
    });
}
function swapContent(address){
    var main = $('#main');
    setTimeout( function(){
        $.ajax({
            method: "GET",
            url: 'https://yerko-alexey.github.io/content/'+ address,
            dataType: "html",
            success: function(data){
                var menu = $('.icon-list');
                var wrap = $('#wrapper');
                var loader = $('.preloader');
                var menuBtn = $('.menu-button');

                wrap.animate(
                    {option: 100},
                    {duration: 1000,
                        start: function(){
                            menuBtn.hide();
                        },
                        step: function(now){
                            loader.show(1000);
                            var x = (now/100-1)*(-1);
                            $(this).css({transform: 'scale(' + x + ')'});
                        },
                        complete: function(){
                            main.html(data);
                            $('#dots-canvas').css('opacity', '0');
                            menu.children().removeClass("active");
                            menu.children('a[href="' + address + '"]').addClass('active');
                            setTimeout(function(){
                                wrap.animate({
                                        option: 0
                                    },
                                    {
                                        duration: 1000,
                                        step: function(now){
                                            console.log(now);
                                            loader.hide(1000);
                                            var x = (now/100-1)*(-1);
                                            $(this).css({transform: 'scale(' + x + ')'});
                                            setTimeout(function(){
                                                if ( address != 'index.html' ) {
                                                    if( address == 'about.html' ){
                                                        navigation();
                                                        expand();
                                                    }
                                                    if( address == 'brandmaster.html' || address == 'cuda.html' || address == 'admin.html' ){
                                                        devices();
                                                        menu.children('a[href="portfolio.html"]').addClass('active');
                                                    }
                                                }
                                                else {
                                                    $('#dots-canvas').css('opacity', '1');
                                                }
                                                listener();
                                            }, 500);
                                        },
                                        complete: function(){
                                            menuBtn.show('slow');
                                        }
                                    }
                                );
                            }, 2000);
                        }
                    }
                );
            },
            error: function(){
                alert("Ошибка! Не удалось загрузить содержимое страницы");
            }
        });
    }, 250);

}
//-History API//

//Header dots function//
function dots() {
    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;
    // Main
    initHeader();
    initAnimation();
    addListeners();
    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};
        largeHeader = document.getElementById('main');
        //largeHeader.style.height = height+'px';
        canvas = document.getElementById('dots-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/20) {
            for(var y = 0; y < height; y = y + height/20) {
                var px = x + Math.random()*width/20;
                var py = y + Math.random()*height/20;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }
        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }
        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 2+Math.random()*4, 'rgba(111,255,223,0.8)');
            points[i].circle = c;                                                                                                                   //
        }
    }
    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }
    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }
    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }
    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }
    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }
    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }
    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(1,160,147,'+ p.active+')';
            ctx.stroke();
        }
    }
    function Circle(pos,rad,color) {
        var _this = this;
        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();
        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(0,95,99,'+ _this.active+')';
            ctx.fill();
        };
    }
    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
}
//-Header dots function//

//Menu//
function menu(){
    var wrapperEl = document.querySelector( '#wrapper' ),
        menu = document.querySelector( '#header' ),
        content = document.querySelector( '#main' ),
        openbtn = document.getElementById( 'open-button' ),
        closebtn = document.getElementById( 'close-button' ),
        isOpen = false,
        morphEl = document.getElementById( 'morph-shape' ),
        s = Snap( morphEl.querySelector( 'svg' ) );
        path = s.select( 'path' );
        initialPath = this.path.attr('d'),
        pathOpen = morphEl.getAttribute( 'data-morph-open' ),
        isAnimating = false;

    function init() {
        initEvents();
    }

    function initEvents() {
        openbtn.addEventListener( 'click', toggleMenu );
        if( closebtn ) {
            closebtn.addEventListener( 'click', toggleMenu );
        }

        content.addEventListener( 'click', function(ev) {
            var target = ev.target;
            if( isOpen && target !== openbtn ) {
                toggleMenu();
            }
        } );
        menu.addEventListener( 'click', function() {
            if( isOpen ) {
                setTimeout( function() {
                    toggleMenu();
                }, 1 );
            }
        } );
    }

    function toggleMenu() {
        if( isAnimating ) return false;
        isAnimating = true;
        if( isOpen ) {
            classie.remove( wrapperEl, 'show-menu' );
            // animate path
            setTimeout( function() {
                // reset path
                path.attr( 'd', initialPath );
                isAnimating = false;
            }, 300 );
        }
        else {
            classie.add( wrapperEl, 'show-menu' );
            // animate path
            path.animate( { 'path' : pathOpen }, 400, mina.easeinout, function() { isAnimating = false; } );
        }
        isOpen = !isOpen;
    }

    init();
}
//-Menu//

//Class helper functions from bonzo https://github.com/ded/bonzo//
function classHelper(window) {
    'use strict';
    function classReg( className ) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }
    var hasClass, addClass, removeClass;
    if ( 'classList' in document.documentElement ) {
        hasClass = function( elem, c ) {
            return elem.classList.contains( c );
        };
        addClass = function( elem, c ) {
            elem.classList.add( c );
        };
        removeClass = function( elem, c ) {
            elem.classList.remove( c );
        };
    }
    else {
        hasClass = function( elem, c ) {
            return classReg( c ).test( elem.className );
        };
        addClass = function( elem, c ) {
            if ( !hasClass( elem, c ) ) {
                elem.className = elem.className + ' ' + c;
            }
        };
        removeClass = function( elem, c ) {
            elem.className = elem.className.replace( classReg( c ), ' ' );
        };
    }
    function toggleClass( elem, c ) {
        var fn = hasClass( elem, c ) ? removeClass : addClass;
        fn( elem, c );
    }
    var classie = {
        // full names
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        // short names
        has: hasClass,
        add: addClass,
        remove: removeClass,
        toggle: toggleClass
    };
// transport
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( classie );
    } else {
        // browser global
        window.classie = classie;
    }
}
//-Class helper functions from bonzo https://github.com/ded/bonzo//

//Navigation button
function navigation() {

    function SVGMenu( el, options ) {
        this.el = el;
        this.init();
    }

    SVGMenu.prototype.init = function() {
        this.trigger = this.el.querySelector( 'button.trigger' );
        this.shapeEl = this.el.querySelector( 'span.morph' );

        var s = Snap( this.shapeEl.querySelector( 'svg' ) );
        this.pathEl = s.select( 'path' );
        this.paths = {
            reset : this.pathEl.attr( 'd' ),
            active : this.shapeEl.getAttribute( 'data-morph-active' )
        };

        this.isOpen = false;

        this.initEvents();
    };

    SVGMenu.prototype.initEvents = function() {
        this.trigger.addEventListener( 'click', this.toggle.bind(this) );
    };

    SVGMenu.prototype.toggle = function() {
        var self = this;

        if( this.isOpen ) {
            classie.remove( this.el, 'navigation--open' );
            classie.add( this.trigger.children[0], 'fa-share' );
            classie.remove( this.trigger.children[0], 'fa-times' );
        }
        else {
            setTimeout(
                function() {
                    classie.add( self.el, 'navigation--open' );
                    classie.remove( self.trigger.children[0], 'fa-share' );
                    classie.add( self.trigger.children[0], 'fa-times' );
                }, 175 );
        }

        this.pathEl.stop().animate( { 'path' : this.paths.active }, 150, mina.easein, function() {
            self.pathEl.stop().animate( { 'path' : self.paths.reset }, 800, mina.elastic );
        } );

        this.isOpen = !this.isOpen;
    };

    new SVGMenu( document.getElementById( 'navigation' ) );

}
//-Navigation button

//Svg. Image inside device
function devices(){
    'use strict';

    var docElem = window.document.documentElement;

    window.requestAnimFrame = function(){
        return (
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback){
                window.setTimeout(callback, 1000 / 60);
            }
        );
    }();

    window.cancelAnimFrame = function(){
        return (
            window.cancelAnimationFrame       ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame    ||
            window.oCancelAnimationFrame      ||
            window.msCancelAnimationFrame     ||
            function(id){
                window.clearTimeout(id);
            }
        );
    }();

    function SVGEl( el ) {
        this.el = el;
        this.image = this.el.previousElementSibling;
        this.current_frame = 0;
        this.total_frames = 60;
        this.path = new Array();
        this.length = new Array();
        this.handle = 0;
        this.init();
    }

    SVGEl.prototype.init = function() {
        var self = this;
        [].slice.call( this.el.querySelectorAll( 'path' ) ).forEach( function( path, i ) {
            self.path[i] = path;
            var l = self.path[i].getTotalLength();
            self.length[i] = l;
            self.path[i].style.strokeDasharray = l + ' ' + l;
            self.path[i].style.strokeDashoffset = l;
        } );
    };

    SVGEl.prototype.render = function() {
        if( this.rendered ) return;
        this.rendered = true;
        this.draw();
    };

    SVGEl.prototype.draw = function() {
        var self = this,
            progress = this.current_frame/this.total_frames;
        if (progress > 1) {
            window.cancelAnimFrame(this.handle);
            this.showImage();
        } else {
            this.current_frame++;
            for(var j=0, len = this.path.length; j<len;j++){
                this.path[j].style.strokeDashoffset = Math.floor(this.length[j] * (1 - progress));
            }
            this.handle = window.requestAnimFrame(function() { self.draw(); });
        }
    };

    SVGEl.prototype.showImage = function() {
        classie.add( this.image, 'show' );
        classie.add( this.el, 'hide' );
    };

    function getViewportH() {
        var client = docElem['clientHeight'],
            inner = window['innerHeight'];

        if( client < inner )
            return inner;
        else
            return client;
    }

    function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
    }

    // http://stackoverflow.com/a/5598797/989439
    function getOffset( el ) {
        var offsetTop = 0, offsetLeft = 0;
        do {
            if ( !isNaN( el.offsetTop ) ) {
                offsetTop += el.offsetTop;
            }
            if ( !isNaN( el.offsetLeft ) ) {
                offsetLeft += el.offsetLeft;
            }
        } while( el = el.offsetParent )

        return {
            top : offsetTop,
            left : offsetLeft
        };
    }

    function inViewport( el, h ) {
        var elH = el.offsetHeight,
            scrolled = scrollY(),
            viewed = scrolled + getViewportH(),
            elTop = getOffset(el).top,
            elBottom = elTop + elH,
        // if 0, the element is considered in the viewport as soon as it enters.
        // if 1, the element is considered in the viewport only when it's fully inside
        // value in percentage (1 >= h >= 0)
            h = h || 0;

        return (elTop + elH * h) <= viewed && (elBottom) >= scrolled;
    }

    function init() {
        var svgs = Array.prototype.slice.call( document.querySelectorAll( '#main svg' ) ),
            svgArr = new Array(),
            didScroll = false,
            resizeTimeout;

        // the svgs already shown...
        svgs.forEach( function( el, i ) {
            var svg = new SVGEl( el );
            svgArr[i] = svg;
            setTimeout(function( el ) {
                return function() {
                    if( inViewport( el.parentNode ) ) {
                        svg.render();
                    }
                };
            }( el ), 250 );
        } );

        var scrollHandler = function() {
                if( !didScroll ) {
                    didScroll = true;
                    setTimeout( function() { scrollPage(); }, 60 );
                }
            },
            scrollPage = function() {
                svgs.forEach( function( el, i ) {
                    if( inViewport( el.parentNode, 0.5 ) ) {
                        svgArr[i].render();
                    }
                });
                didScroll = false;
            },
            resizeHandler = function() {
                function delayed() {
                    scrollPage();
                    resizeTimeout = null;
                }
                if ( resizeTimeout ) {
                    clearTimeout( resizeTimeout );
                }
                resizeTimeout = setTimeout( delayed, 200 );
            };

        window.addEventListener( 'scroll', scrollHandler, false );
        window.addEventListener( 'resize', resizeHandler, false );
    }

    init();
}
//-Svg. Image inside devices