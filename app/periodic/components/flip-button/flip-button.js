//*****************************************************************
// A button that can be pressed by hovering a hand over it.
//
// The bulk of the code is to draw an arc around the (circular)
// button, which grows while hovered and shrinks again when the
// hand is removed.
//
// The `proceed` function is called when it is hovered for long enough.
//*****************************************************************

FlipButton = Button.create({
  duration: 4000,
  interval:null,
  name: "flip-button",
  fixed: true,

  flipReady:true,
  flipState:"front",

  content:"",
  backText:"Loading...",

  hoverPulseActive:false,
  hoverPulseFirst:false,

  html: function(){
    return  '<div class="card">' +
              '<div class="front">' +
                '<div class="front-content"></div>' +
              '</div>' +
              '<div class="back">' +
                '<div class="back-content"></div>' +
              '</div>' +
            '</div>';
  },

  // Check whether one or both of the user's hands is over the button
  checkHover: function(x, y) {
    var center = {};

    center.x = this.x + this.element.outerWidth()/2;
    center.y = this.y + this.element.outerHeight()/2;

    // Hover detection
    var hovering = false;
    var dX = center.x - x;
    var dY = center.y - y;


    var halfWidth = this.element.outerWidth()/2;
    var halfHeigth = this.element.outerHeight()/2;

    // Check the button itself
    if((Math.abs(dX)<halfWidth)&&(Math.abs(dY)<halfHeigth))
      hovering = true;

    //repeat for selector button (button icon)
    var centerIcon = {};
    centerIcon.x = this.x + parseInt(this.subElm('.selector-button').css("left")) + this.subElm('.selector-button').outerWidth()/2;

    if(this.subElm('.selector-button').css("left") == 'auto'){
      centerIcon.x = this.x + parseInt(this.subElm('.selector-button').css("right")) + this.subElm('.selector-button').outerWidth()/2;
    }

    centerIcon.y = this.y +  parseInt(this.subElm('.selector-button').css("top")) + this.subElm('.selector-button').outerHeight()/2;

    // Hover detection
    dX = centerIcon.x - x;
    dY = centerIcon.y - y;

    halfWidth = this.subElm('.selector-button').outerWidth()/2;
    halfHeigth = this.subElm('.selector-button').outerHeight()/2;
    // Check the button itself
    if((Math.abs(dX)<halfWidth)&&(Math.abs(dY)<halfHeigth))
      hovering = true;

    return hovering;
  },

  flip:function(flip){
    if(this.flipReady){
      if (flip){
        //flip forward
        this.frontFlip();
      }
      else {
        //flip backwards
        this.backFlip();
      }
    }

  },


  frontFlip:function(){
    var self = this;
    this.flipReady = false;
    this.element.addClass('flipped');

    this.flipReady = true; // Should be delayed until after the flip animation
  },

  backFlip:function(){
    var self = this;
    this.flipReady = false;
    this.element.removeClass('flipped');

    this.flipReady = true; // Should be delayed until after the flip animation
  },

  shown: function() {

    this.proceeding = false;
    this.interval = null;

    this.hoverPulseActive = false;
    this.hoverPulseFirst = false;

    this._onShown();

  },

  _onShown: function() {

    //this.subElm(".back-content").css('-webkit-transform', this.flipAxis +'(90deg)');

    if(this.flipAxis == 'rotateY'){
      this.subElm(".flip-animation-text").css('-webkit-transform', 'scaleX(-1)');
    }
    else{
      this.subElm(".flip-animation-text").css('-webkit-transform', 'scaleX(1)');
      this.subElm(".back-content .container").css('-webkit-transform', 'scaleY(-1)');
    }


  },

  hover: function() {
    this.flip(true);

    if (this.hovering)
      this.isHovering();

    if (!this.hovering) {
      this.hovering = true;

      if (!this.interval) {
        // Start progress animation
        var progress = this.subElm('.back .progress');
        var margin = parseInt(progress.css('left')) || parseInt(progress.css('right')); // One of the two will be set
        var fullWidth = this.element.outerWidth() - margin;
        progress.transition({width: fullWidth+'px'}, this.duration, 'linear');
        this.interval = window.setTimeout(this.fillButton, this.duration);
      }
    }
  },
  unhover: function() {
    this.flip(false);
    if (this.hovering) {
      this.hovering = false;
      this.hoverPulseFirst = false;

      // Stop progress animation and reset width to zero
      this.subElm('.back .progress').stop().css({width: '0'});
      window.clearTimeout(this.interval);
      this.interval=null;
    }
  },

  isHovering: function(){
    var self = this;

    if(!this.hoverPulseFirst){
      this.hoverPulseFirst = true;

      this.addTimeout('hover-pulse-first', function(){
        self.hoverPulse();
      },250);
    }
    else{

      if(!this.hoverPulseActive){
        this.hoverPulseActive = true;

        this.addTimeout('hover-pulse', function(){
          self.hoverPulseActive = false;

          if(self.hovering)
            self.hoverPulse();
        },1500);
      }
    }

  },

  hoverPulse: function(){

  },

});
